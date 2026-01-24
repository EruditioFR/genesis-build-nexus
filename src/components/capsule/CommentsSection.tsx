import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Trash2, Edit2, X, Check, User } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Locale } from 'date-fns';
import { fr, enUS, es, ko, zhCN } from 'date-fns/locale';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  profile?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface CommentsSectionProps {
  capsuleId: string;
  currentUserId: string;
}

const dateLocales: Record<string, Locale> = { fr, en: enUS, es, ko, zh: zhCN };

const CommentsSection = ({ capsuleId, currentUserId }: CommentsSectionProps) => {
  const { t, i18n } = useTranslation('capsules');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
  const currentLocale = dateLocales[i18n.language] || enUS;

  useEffect(() => {
    fetchComments();
  }, [capsuleId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('capsule_id', capsuleId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch profiles for each comment
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(c => c.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, display_name, avatar_url')
          .in('user_id', userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p]));
        
        const commentsWithProfiles = data.map(comment => ({
          ...comment,
          profile: profileMap.get(comment.user_id) || null,
        }));

        setComments(commentsWithProfiles);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          capsule_id: capsuleId,
          user_id: currentUserId,
          content: newComment.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      // Fetch current user's profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', currentUserId)
        .maybeSingle();

      setComments(prev => [...prev, { ...data, profile }]);
      setNewComment('');
      toast.success(t('comments.added'));
    } catch (error: any) {
      toast.error(error.message || t('comments.error_add'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .update({ content: editContent.trim() })
        .eq('id', commentId);

      if (error) throw error;

      setComments(prev =>
        prev.map(c =>
          c.id === commentId
            ? { ...c, content: editContent.trim(), updated_at: new Date().toISOString() }
            : c
        )
      );
      setEditingId(null);
      setEditContent('');
      toast.success(t('comments.updated'));
    } catch (error: any) {
      toast.error(error.message || t('comments.error_update'));
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments(prev => prev.filter(c => c.id !== commentId));
      toast.success(t('comments.deleted'));
    } catch (error: any) {
      toast.error(error.message || t('comments.error_delete'));
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent('');
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5 text-secondary" />
          <h3 className="font-semibold text-foreground">{t('comments.title')}</h3>
        </div>
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-secondary" />
        <h3 className="font-semibold text-foreground">
          {t('comments.title')} ({comments.length})
        </h3>
      </div>

      {/* Comments List */}
      <div className="space-y-4 mb-6">
        <AnimatePresence mode="popLayout">
          {comments.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-muted-foreground py-8"
            >
              {t('comments.empty')}
            </motion.p>
          ) : (
            comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex gap-3"
              >
                <Avatar className="w-9 h-9 flex-shrink-0">
                  <AvatarImage src={comment.profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-secondary/20 text-secondary text-xs">
                    {getInitials(comment.profile?.display_name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-foreground">
                      {comment.profile?.display_name || t('comments.anonymous_user')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(comment.created_at), 'd MMM yyyy, HH:mm', { locale: currentLocale })}
                    </span>
                    {comment.updated_at !== comment.created_at && (
                      <span className="text-xs text-muted-foreground italic">({t('comments.edited')})</span>
                    )}
                  </div>

                  {editingId === comment.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[80px] resize-none"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleEdit(comment.id)}
                          disabled={!editContent.trim()}
                          className="gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          {t('comments.save')}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEditing}
                          className="gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          {t('comments.cancel')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  )}

                  {/* Actions for own comments */}
                  {comment.user_id === currentUserId && editingId !== comment.id && (
                    <div className="flex gap-1 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(comment)}
                        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Edit2 className="w-3 h-3 mr-1" />
                        {t('comments.edit')}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            {t('comments.delete')}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('comments.delete_confirm_title')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('comments.delete_confirm_description')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('comments.cancel')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(comment.id)}>
                              {t('comments.delete')}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* New Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t('comments.placeholder')}
            className="min-h-[80px] resize-none"
          />
        </div>
        <Button
          type="submit"
          size="icon"
          disabled={!newComment.trim() || isSubmitting}
          className="h-10 w-10 flex-shrink-0 bg-gradient-gold hover:opacity-90"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default CommentsSection;
