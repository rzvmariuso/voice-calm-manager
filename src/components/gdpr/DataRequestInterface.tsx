import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { 
  Download, 
  Trash2, 
  Edit, 
  Eye, 
  Mail, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield
} from "lucide-react"
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
} from "@/components/ui/alert-dialog"

type RequestType = 'data_export' | 'data_deletion' | 'data_correction' | 'data_portability'

interface DataRequest {
  id: string
  request_type: RequestType
  requested_by_email: string
  status: 'pending' | 'completed' | 'rejected'
  notes?: string
  created_at: string
  completed_at?: string
}

export function DataRequestInterface() {
  const [requests, setRequests] = useState<DataRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [newRequestEmail, setNewRequestEmail] = useState("")
  const [newRequestType, setNewRequestType] = useState<RequestType>('data_export')
  const [newRequestNotes, setNewRequestNotes] = useState("")
  const { toast } = useToast()

  // Load requests on component mount
  useEffect(() => {
    loadRequests()
  }, [])

  const requestTypeLabels = {
    data_export: "Datenauskunft",
    data_deletion: "Datenlöschung", 
    data_correction: "Datenberichtigung",
    data_portability: "Datenübertragung"
  }

  const requestTypeIcons = {
    data_export: Eye,
    data_deletion: Trash2,
    data_correction: Edit,
    data_portability: Download
  }

  const loadRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('data_requests')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setRequests((data || []) as DataRequest[])
    } catch (error) {
      console.error('Error loading requests:', error)
      toast({
        title: "Fehler",
        description: "Anfragen konnten nicht geladen werden",
        variant: "destructive"
      })
    }
  }

  const createRequest = async () => {
    if (!newRequestEmail.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie eine E-Mail-Adresse ein",
        variant: "destructive"
      })
      return
    }

    try {
      setLoading(true)

      // Get current user's practice_id
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Nicht authentifiziert')

      const { data: practices, error: practiceError } = await supabase
        .from('practices')
        .select('id')
        .eq('owner_id', user.id)
        .single()

      if (practiceError) throw practiceError

      const { error } = await supabase
        .from('data_requests')
        .insert({
          request_type: newRequestType,
          requested_by_email: newRequestEmail.trim(),
          notes: newRequestNotes.trim() || null,
          status: 'pending',
          practice_id: practices.id
        })

      if (error) throw error
      
      toast({
        title: "Anfrage erstellt",
        description: `${requestTypeLabels[newRequestType]} wurde erfolgreich erstellt`,
      })
      
      setNewRequestEmail("")
      setNewRequestNotes("")
      loadRequests()
    } catch (error) {
      console.error('Error creating request:', error)
      toast({
        title: "Fehler",
        description: "Anfrage konnte nicht erstellt werden",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const completeRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('data_requests')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', requestId)

      if (error) throw error
      
      toast({
        title: "Anfrage abgeschlossen",
        description: "Die Anfrage wurde als erledigt markiert",
      })
      
      loadRequests()
    } catch (error) {
      console.error('Error completing request:', error)
      toast({
        title: "Fehler",
        description: "Anfrage konnte nicht abgeschlossen werden",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="default" className="bg-success text-success-foreground">
            <CheckCircle className="w-3 h-3 mr-1" />
            Erledigt
          </Badge>
        )
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-warning text-warning-foreground">
            <Clock className="w-3 h-3 mr-1" />
            Offen
          </Badge>
        )
      case 'rejected':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Abgelehnt
          </Badge>
        )
      default:
        return <Badge variant="outline">Unbekannt</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-primary mb-1">DSGVO-Compliance</p>
              <p className="text-muted-foreground">
                Verwalten Sie Anfragen zur Datenauskunft, -löschung und -berichtigung gemäß Art. 15-20 DSGVO.
                Alle Anfragen werden protokolliert und müssen innerhalb von 30 Tagen bearbeitet werden.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create New Request */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Neue DSGVO-Anfrage erstellen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">E-Mail des Antragstellers</Label>
              <Input
                id="email"
                type="email"
                value={newRequestEmail}
                onChange={(e) => setNewRequestEmail(e.target.value)}
                placeholder="patient@example.com"
              />
            </div>
            
            <div>
              <Label htmlFor="type">Art der Anfrage</Label>
              <select
                id="type"
                value={newRequestType}
                onChange={(e) => setNewRequestType(e.target.value as RequestType)}
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-md"
              >
                {Object.entries(requestTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notizen (optional)</Label>
            <Textarea
              id="notes"
              value={newRequestNotes}
              onChange={(e) => setNewRequestNotes(e.target.value)}
              placeholder="Zusätzliche Informationen zur Anfrage..."
              rows={3}
            />
          </div>

          <Button 
            onClick={createRequest}
            disabled={loading}
            className="bg-gradient-primary text-white shadow-glow"
          >
            <Mail className="w-4 h-4 mr-2" />
            {loading ? "Erstelle..." : "Anfrage erstellen"}
          </Button>
        </CardContent>
      </Card>

      {/* Existing Requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              DSGVO-Anfragen ({requests.length})
            </CardTitle>
            <Button variant="outline" onClick={loadRequests}>
              Aktualisieren
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Noch keine DSGVO-Anfragen vorhanden</p>
              <p className="text-sm">Erstellen Sie eine neue Anfrage oben</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => {
                const Icon = requestTypeIcons[request.request_type]
                return (
                  <div 
                    key={request.id}
                    className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium">
                              {requestTypeLabels[request.request_type]}
                            </h3>
                            {getStatusBadge(request.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {request.requested_by_email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Erstellt: {new Date(request.created_at).toLocaleDateString('de-DE')}
                            {request.completed_at && (
                              <span> • Erledigt: {new Date(request.completed_at).toLocaleDateString('de-DE')}</span>
                            )}
                          </p>
                          {request.notes && (
                            <p className="text-sm text-muted-foreground italic mt-1">
                              "{request.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {request.status === 'pending' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" className="bg-success text-success-foreground">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Erledigen
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Anfrage als erledigt markieren?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bestätigen Sie, dass die {requestTypeLabels[request.request_type].toLowerCase()} 
                                  für {request.requested_by_email} bearbeitet wurde.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => completeRequest(request.id)}
                                  className="bg-success text-success-foreground"
                                >
                                  Als erledigt markieren
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
