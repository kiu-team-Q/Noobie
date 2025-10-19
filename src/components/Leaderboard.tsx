import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Medal, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
interface LeaderboardEntry {
  id: string;
  first_name: string;
  last_name: string;
  rating_points: number;
  position_id: string;
}
interface LeaderboardProps {
  companyId: string;
  positionId: string;
  currentUserId: string;
}
export const Leaderboard = ({
  companyId,
  positionId,
  currentUserId
}: LeaderboardProps) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadLeaderboard();
  }, [companyId, positionId]);
  const loadLeaderboard = async () => {
    const {
      data,
      error
    } = await supabase.from("users").select("id, first_name, last_name, rating_points, position_id").eq("company_id", companyId).eq("position_id", positionId).order("rating_points", {
      ascending: false
    });
    if (!error && data) {
      setLeaderboard(data);
    }
    setLoading(false);
  };
  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Medal className="h-5 w-5 text-amber-600" />;
    return <Award className="h-4 w-4 text-muted-foreground" />;
  };
  if (loading) {
    return <Card className="border-border/50 bg-card shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Position Leaderboard</h3>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </Card>;
  }
  return <Card className="border-border/50 bg-card shadow-sm animate-fade-in h-[285px] flex flex-col">
      <div className="p-6 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Trophy className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-card-foreground">Position Leaderboard</h3>
        </div>
      </div>
      
      <ScrollArea className="flex-1 px-6 pb-6">
        <div className="space-y-1">
          {leaderboard.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">
              No other interns in this position yet
            </p> : leaderboard.map((entry, index) => <div key={entry.id} className={`flex items-center gap-2 p-1.5 rounded-lg transition-colors ${entry.id === currentUserId ? "bg-primary/10 border border-primary/20" : "bg-muted/30 hover:bg-muted/50"}`}>
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-background">
                  {getRankIcon(index)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${entry.id === currentUserId ? "text-primary" : "text-foreground"}`}>
                    {entry.first_name} {entry.last_name}
                    {entry.id === currentUserId && " (You)"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Rank #{index + 1}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-primary">{entry.rating_points}</p>
                  <p className="text-[10px] text-muted-foreground">points</p>
                </div>
              </div>)}
        </div>
      </ScrollArea>
    </Card>;
};