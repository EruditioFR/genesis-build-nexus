import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Image, FileText, Video, Music, Layers } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import NotificationsBell from "@/components/notifications/NotificationsBell";
import GlobalSearch from "@/components/search/GlobalSearch";
import ThemeToggle from "@/components/ThemeToggle";
import type { Database } from "@/integrations/supabase/types";

type Capsule = Database["public"]["Tables"]["capsules"]["Row"];

const capsuleTypeIcons: Record<string, React.ReactNode> = {
  text: <FileText className="h-3 w-3" />,
  photo: <Image className="h-3 w-3" />,
  video: <Video className="h-3 w-3" />,
  audio: <Music className="h-3 w-3" />,
  mixed: <Layers className="h-3 w-3" />,
};

const capsuleStatusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-primary/20 text-primary",
  scheduled: "bg-accent/20 text-accent-foreground",
  archived: "bg-secondary text-secondary-foreground",
};

export default function CalendarPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateType, setDateType] = useState<"created" | "scheduled">("created");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchCapsules();
    }
  }, [user, currentMonth]);

  const fetchCapsules = async () => {
    if (!user) return;

    setLoading(true);
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    const { data, error } = await supabase
      .from("capsules")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCapsules(data);
    }
    setLoading(false);
  };

  const getCapsulesByDate = (date: Date) => {
    return capsules.filter((capsule) => {
      const capsuleDate = dateType === "created" 
        ? new Date(capsule.created_at) 
        : capsule.scheduled_at ? new Date(capsule.scheduled_at) : null;
      
      if (!capsuleDate) return false;
      return isSameDay(capsuleDate, date);
    });
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const startDayOfWeek = startOfMonth(currentMonth).getDay();
  const adjustedStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <CalendarIcon className="h-12 w-12 text-primary" />
          <p className="text-muted-foreground">Chargement du calendrier...</p>
        </div>
      </div>
    );
  }

  const selectedDateCapsules = selectedDate ? getCapsulesByDate(selectedDate) : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Tableau de bord
            </Button>
            <h1 className="text-xl font-semibold font-display">Calendrier</h1>
          </div>
          <div className="flex items-center gap-4">
            {user && <GlobalSearch userId={user.id} />}
            {user && <NotificationsBell userId={user.id} />}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_350px] gap-8">
          {/* Calendar Grid */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="icon" onClick={prevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <CardTitle className="text-xl font-display min-w-[200px] text-center">
                    {format(currentMonth, "MMMM yyyy", { locale: fr })}
                  </CardTitle>
                  <Button variant="outline" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={goToToday}>
                    Aujourd'hui
                  </Button>
                </div>
                <Tabs value={dateType} onValueChange={(v) => setDateType(v as "created" | "scheduled")}>
                  <TabsList>
                    <TabsTrigger value="created" className="gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      Création
                    </TabsTrigger>
                    <TabsTrigger value="scheduled" className="gap-2">
                      <Clock className="h-4 w-4" />
                      Programmé
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before the month starts */}
                {Array.from({ length: adjustedStartDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}

                {days.map((day) => {
                  const dayCapsules = getCapsulesByDate(day);
                  const isToday = isSameDay(day, new Date());
                  const isSelected = selectedDate && isSameDay(day, selectedDate);

                  return (
                    <motion.button
                      key={day.toISOString()}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        aspect-square p-1 rounded-lg border transition-colors relative
                        ${isToday ? "border-primary bg-primary/5" : "border-transparent"}
                        ${isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}
                        ${dayCapsules.length > 0 ? "hover:bg-accent" : "hover:bg-muted/50"}
                      `}
                    >
                      <div className={`text-sm ${isToday ? "font-bold text-primary" : ""}`}>
                        {format(day, "d")}
                      </div>
                      {dayCapsules.length > 0 && (
                        <div className="absolute bottom-1 left-1 right-1 flex justify-center gap-0.5 flex-wrap">
                          {dayCapsules.slice(0, 3).map((capsule, i) => (
                            <div
                              key={capsule.id}
                              className={`h-1.5 w-1.5 rounded-full ${
                                capsule.status === "published" ? "bg-primary" :
                                capsule.status === "scheduled" ? "bg-amber-500" :
                                capsule.status === "draft" ? "bg-muted-foreground" :
                                "bg-secondary-foreground"
                              }`}
                            />
                          ))}
                          {dayCapsules.length > 3 && (
                            <span className="text-[10px] text-muted-foreground">+{dayCapsules.length - 3}</span>
                          )}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-xs text-muted-foreground">Publiée</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-xs text-muted-foreground">Programmée</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Brouillon</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Date Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-display">
                {selectedDate 
                  ? format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })
                  : "Sélectionnez une date"
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedDate ? (
                <p className="text-muted-foreground text-sm">
                  Cliquez sur une date du calendrier pour voir les capsules correspondantes.
                </p>
              ) : selectedDateCapsules.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground text-sm">
                    Aucune capsule {dateType === "created" ? "créée" : "programmée"} ce jour.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4"
                    onClick={() => navigate("/capsules/new")}
                  >
                    Créer une capsule
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {selectedDateCapsules.map((capsule) => (
                      <motion.div
                        key={capsule.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group"
                      >
                        <button
                          onClick={() => navigate(`/capsules/${capsule.id}`)}
                          className="w-full text-left p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                                {capsule.title}
                              </h4>
                              {capsule.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {capsule.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {capsuleTypeIcons[capsule.capsule_type]}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className={`text-xs ${capsuleStatusColors[capsule.status]}`}>
                              {capsule.status === "draft" ? "Brouillon" :
                               capsule.status === "published" ? "Publiée" :
                               capsule.status === "scheduled" ? "Programmée" : "Archivée"}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(capsule.created_at), "HH:mm")}
                            </span>
                          </div>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
