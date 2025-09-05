import React, { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone as PhoneIcon, Smartphone, Users, MessageSquare, Settings, Activity, TrendingUp, Bot } from "lucide-react";
import TelephonyInterface from "@/components/telephony/TelephonyInterface";

const Phone = () => {
  const [callStatus, setCallStatus] = useState('idle');

  // Mock stats - in production, these would come from your database
  const stats = {
    totalCalls: 24,
    appointmentsBooked: 18,
    transferredToHuman: 3,
    avgDuration: "2:34",
    successRate: 75
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 p-6 bg-background">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                  Telefonie & Voice AI
                </h1>
                <p className="text-muted-foreground">
                  DSGVO-konforme Telefonie-Integration mit Vapi für Deutschland
                </p>
              </div>
            </div>
            <Badge variant={callStatus === 'active' ? 'default' : 'secondary'}>
              {callStatus === 'active' ? 'Anrufe aktiv' : 'Bereit'}
            </Badge>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Heute</p>
                    <p className="text-2xl font-bold text-foreground">{stats.totalCalls}</p>
                    <p className="text-xs text-muted-foreground">+12% von gestern</p>
                  </div>
                  <PhoneIcon className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Termine gebucht</p>
                    <p className="text-2xl font-bold text-success">{stats.appointmentsBooked}</p>
                    <p className="text-xs text-muted-foreground">{stats.successRate}% Erfolgsquote</p>
                  </div>
                  <MessageSquare className="w-8 h-8 text-success" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Weitergeleitet</p>
                    <p className="text-2xl font-bold text-primary">{stats.transferredToHuman}</p>
                    <p className="text-xs text-muted-foreground">Zu Mitarbeitern</p>
                  </div>
                  <Users className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ø Gesprächsdauer</p>
                    <p className="text-2xl font-bold text-foreground">{stats.avgDuration}</p>
                    <p className="text-xs text-muted-foreground">Minuten</p>
                  </div>
                  <Smartphone className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">KI-Automatisierung</p>
                    <p className="text-2xl font-bold text-secondary">85%</p>
                    <p className="text-xs text-muted-foreground">der Anrufe</p>
                  </div>
                  <Bot className="w-8 h-8 text-secondary" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Telephony Interface - Takes 2 columns */}
            <div className="lg:col-span-2">
              <TelephonyInterface onCallStatusChange={setCallStatus} />
            </div>

            {/* System Status & Info */}
            <div className="space-y-6">
              {/* System Status */}
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Vapi Integration</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-success">Online</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">OpenAI GPT</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-success">Aktiv</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Vapi Voice</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-success">Bereit</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">DSGVO Status</span>
                      <Badge variant="outline" className="border-success text-success text-xs">
                        Konform
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Phone;