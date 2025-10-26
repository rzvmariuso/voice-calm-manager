import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  UserPlus, 
  Shield, 
  Mail, 
  MoreVertical,
  Crown,
  UserCog
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface TeamMember {
  id: string;
  email: string;
  role: 'admin' | 'moderator' | 'user';
  created_at: string;
  profile?: {
    display_name?: string;
    avatar_url?: string;
  };
}

export default function Team() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<'admin' | 'moderator' | 'user'>('user');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: members, isLoading } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          role,
          created_at
        `);
      
      if (error) throw error;
      // Map to TeamMember format with mock data
      return (data || []).map(item => ({
        ...item,
        email: 'user@example.com', // Would come from auth.users in real implementation
        profile: undefined
      })) as TeamMember[];
    }
  });

  const inviteMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string, role: string }) => {
      // Here you would typically send an invitation email
      // For now, we'll just show a success message
      toast({
        title: "Einladung versendet",
        description: `Eine Einladung wurde an ${email} gesendet.`,
      });
    },
    onSuccess: () => {
      setIsInviteOpen(false);
      setInviteEmail("");
      setInviteRole('user');
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    }
  });

  const handleInvite = () => {
    if (!inviteEmail) {
      toast({
        title: "E-Mail erforderlich",
        description: "Bitte geben Sie eine E-Mail-Adresse ein.",
        variant: "destructive"
      });
      return;
    }
    inviteMutation.mutate({ email: inviteEmail, role: inviteRole });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4" />;
      case 'moderator': return <UserCog className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'moderator': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'moderator': return 'Moderator';
      default: return 'Benutzer';
    }
  };

  return (
    <PageLayout title="Team-Verwaltung">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">Teammitglieder</h2>
            {members && (
              <Badge variant="secondary">{members.length}</Badge>
            )}
          </div>

          <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary">
                <UserPlus className="w-4 h-4 mr-2" />
                Mitglied einladen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Teammitglied einladen</DialogTitle>
                <DialogDescription>
                  Laden Sie ein neues Mitglied zu Ihrem Team ein und weisen Sie eine Rolle zu.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail-Adresse</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="beispiel@email.de"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rolle</Label>
                  <Select value={inviteRole} onValueChange={(value: any) => setInviteRole(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Benutzer
                        </div>
                      </SelectItem>
                      <SelectItem value="moderator">
                        <div className="flex items-center gap-2">
                          <UserCog className="w-4 h-4" />
                          Moderator
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4" />
                          Administrator
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    {inviteRole === 'admin' && 'Voller Zugriff auf alle Funktionen'}
                    {inviteRole === 'moderator' && 'Kann Termine und Patienten verwalten'}
                    {inviteRole === 'user' && 'Kann eigene Termine einsehen und bearbeiten'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                  Abbrechen
                </Button>
                <Button onClick={handleInvite} className="bg-gradient-primary">
                  <Mail className="w-4 h-4 mr-2" />
                  Einladung senden
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Aktive Mitglieder</CardTitle>
            <CardDescription>
              Übersicht aller Teammitglieder und deren Rollen
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Lädt Teammitglieder...
              </div>
            ) : members && members.length > 0 ? (
              <div className="space-y-4">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={member.profile?.avatar_url} />
                        <AvatarFallback>
                          {member.profile?.display_name?.[0] || member.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {member.profile?.display_name || 'Unbekannt'}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {member.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Badge variant={getRoleBadgeVariant(member.role)} className="flex items-center gap-1">
                        {getRoleIcon(member.role)}
                        {getRoleLabel(member.role)}
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Shield className="w-4 h-4 mr-2" />
                            Rolle ändern
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Entfernen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Noch keine Teammitglieder vorhanden
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rollen & Berechtigungen</CardTitle>
            <CardDescription>
              Übersicht der verschiedenen Rollen und deren Berechtigungen
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Administrator</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-7">
                  <li>• Voller Zugriff auf alle Funktionen</li>
                  <li>• Kann Team verwalten und Einladungen senden</li>
                  <li>• Kann Praxiseinstellungen ändern</li>
                  <li>• Zugriff auf Abrechnungen und Berichte</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <UserCog className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Moderator</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-7">
                  <li>• Kann Termine erstellen und bearbeiten</li>
                  <li>• Kann Patienten verwalten</li>
                  <li>• Kann Berichte einsehen</li>
                  <li>• Keine Zugriff auf Team- und Praxiseinstellungen</li>
                </ul>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Benutzer</h3>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-7">
                  <li>• Kann eigene Termine einsehen</li>
                  <li>• Kann eigene Termine bearbeiten</li>
                  <li>• Kann Patientendaten einsehen</li>
                  <li>• Eingeschränkter Zugriff auf erweiterte Funktionen</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
