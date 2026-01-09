import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  addMonths, 
  subMonths, 
  addWeeks, 
  subWeeks 
} from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Image, FileText, Video, Music, Layers, Grid3X3, LayoutList } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import NotificationsBell from "@/components/notifications/NotificationsBell";
import GlobalSearch from "@/components/search/GlobalSearch";

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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateType, setDateType] = useState<"created" | "scheduled">("created");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchCapsules();
    }
  }, [user, currentDate]);

  const fetchCapsules = async () => {
    if (!user) return;

    setLoading(true);
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

  // Month view days
  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  // Week view days
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const startDayOfWeek = startOfMonth(currentDate).getDay();
  const adjustedStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  const prevPeriod = () => {
    if (viewMode === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const nextPeriod = () => {
    if (viewMode === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const goToToday = () => setCurrentDate(new Date());

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

  const getHeaderTitle = () => {
    if (viewMode === "month") {
      return format(currentDate, "MMMM yyyy", { locale: fr });
    } else {
      const weekStartFormatted = format(weekStart, "d MMM", { locale: fr });
      const weekEndFormatted = format(weekEnd, "d MMM yyyy", { locale: fr });
      return `${weekStartFormatted} - ${weekEndFormatted}`;
    }
  };

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
            
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_350px] gap-8">
          {/* Calendar Grid */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <Button variant="outline" size="icon" onClick={prevPeriod}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <CardTitle className="text-lg sm:text-xl font-display min-w-[180px] sm:min-w-[250px] text-center capitalize">
                      {getHeaderTitle()}
                    </CardTitle>
                    <Button variant="outline" size="icon" onClick={nextPeriod}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={goToToday}>
                      Aujourd'hui
                    </Button>
                  </div>
                  
                  {/* View Mode Toggle */}
                  <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "month" | "week")}>
                    <TabsList>
                      <TabsTrigger value="month" className="gap-2">
                        <Grid3X3 className="h-4 w-4" />
                        <span className="hidden sm:inline">Mois</span>
                      </TabsTrigger>
                      <TabsTrigger value="week" className="gap-2">
                        <LayoutList className="h-4 w-4" />
                        <span className="hidden sm:inline">Semaine</span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                {/* Date Type Toggle */}
                <Tabs value={dateType} onValueChange={(v) => setDateType(v as "created" | "scheduled")}>
                  <TabsList className="w-full sm:w-auto">
                    <TabsTrigger value="created" className="gap-2 flex-1 sm:flex-none">
                      <CalendarIcon className="h-4 w-4" />
                      Création
                    </TabsTrigger>
                    <TabsTrigger value="scheduled" className="gap-2 flex-1 sm:flex-none">
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

              {viewMode === "month" ? (
                /* Month View */
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells for days before the month starts */}
                  {Array.from({ length: adjustedStartDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}

                  {monthDays.map((day) => {
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
                            {dayCapsules.slice(0, 3).map((capsule) => (
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
              ) : (
                /* Week View */
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day) => {
                    const dayCapsules = getCapsulesByDate(day);
                    const isToday = isSameDay(day, new Date());
                    const isSelected = selectedDate && isSameDay(day, selectedDate);

                    return (
                      <motion.div
                        key={day.toISOString()}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col"
                      >
                        <button
                          onClick={() => setSelectedDate(day)}
                          className={`
                            p-2 rounded-lg border transition-colors mb-2
                            ${isToday ? "border-primary bg-primary/5" : "border-border"}
                            ${isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}
                            hover:bg-accent/50
                          `}
                        >
                          <div className={`text-lg font-semibold ${isToday ? "text-primary" : ""}`}>
                            {format(day, "d")}
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {format(day, "MMM", { locale: fr })}
                          </div>
                        </button>
                        
                        <ScrollArea className="flex-1 max-h-[300px]">
                          <div className="space-y-1">
                            {dayCapsules.length === 0 ? (
                              <p className="text-xs text-muted-foreground text-center py-4">—</p>
                            ) : (
                              dayCapsules.map((capsule) => (
                                <button
                                  key={capsule.id}
                                  onClick={() => navigate(`/capsules/${capsule.id}`)}
                                  className={`
                                    w-full text-left p-2 rounded text-xs transition-colors
                                    ${capsule.status === "published" ? "bg-primary/10 hover:bg-primary/20" :
                                      capsule.status === "scheduled" ? "bg-amber-500/10 hover:bg-amber-500/20" :
                                      "bg-muted hover:bg-muted/80"}
                                  `}
                                >
                                  <div className="flex items-center gap-1">
                                    {capsuleTypeIcons[capsule.capsule_type]}
                                    <span className="truncate font-medium">{capsule.title}</span>
                                  </div>
                                  <div className="text-muted-foreground mt-0.5">
                                    {format(new Date(capsule.created_at), "HH:mm")}
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        </ScrollArea>
                      </motion.div>
                    );
                  })}
                </div>
              )}

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
              <CardTitle className="text-lg font-display capitalize">
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
