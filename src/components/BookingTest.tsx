import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

const BookingTest = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testSuccessfulBooking = async () => {
    setLoading(true);
    setResult(null);

    try {
      const testData = {
        message: {
          type: "end-of-call-report",
          analysis: {
            summary: "Max Mustermann called to book a massage appointment for Monday 10:30. The AI assistant successfully booked the appointment.",
            successEvaluation: "true"
          },
          artifact: {
            transcript: `AI: Hallo, Hier ist der Ai Assistent der Praxis. Gerne helfe ich Ihnen bei der Terminbuchung. Wie kann ich Ihnen helfen?
User: Hallo, ich möchte einen Termin buchen. Mein Name ist Max Mustermann.
AI: Gerne kann ich einen Termin für Sie buchen, Herr Mustermann. Wie lautet Ihre Telefonnummer?
User: 01234567890
AI: Danke. Wann hätten Sie gerne einen Termin?
User: Montag um 10 Uhr 30 für eine Massage bitte.
AI: Perfekt. Lassen Sie mich das zusammenfassen: Max Mustermann, 01234567890, Montag 10:30 Uhr, Massage. Ist das korrekt?
User: Ja.
AI: Perfekt, ich werde Ihre Daten jetzt zur Buchung des Termins senden. Ihr Termin für eine Massage am Montag um 10:30 ist erfolgreich gebucht!`
          }
        },
        call: {
          customer: {
            number: "+4901234567890"
          },
          assistant: {
            metadata: {
              practiceId: "8b4d340f-075e-494b-86d3-65742a33c07c"
            }
          }
        }
      };

      const { data, error } = await supabase.functions.invoke('ai-booking', {
        body: testData
      });

      if (error) {
        setResult({ error: error.message, success: false });
      } else {
        setResult({ ...data, success: true });
      }
    } catch (err: any) {
      setResult({ error: err.message, success: false });
    } finally {
      setLoading(false);
    }
  };

  const testFailedBooking = async () => {
    setLoading(true);
    setResult(null);

    try {
      const testData = {
        message: {
          type: "end-of-call-report",
          analysis: {
            summary: "User called but hung up without completing booking.",
            successEvaluation: "false"
          },
          artifact: {
            transcript: `AI: Hallo, Hier ist der Ai Assistent der Praxis. Gerne helfe ich Ihnen bei der Terminbuchung. Wie kann ich Ihnen helfen?
User: Hallo, ich wollte... äh... eigentlich nichts. Tschüss.
AI: Gerne helfe ich Ihnen bei Fragen. Haben Sie einen schönen Tag!`
          }
        },
        call: {
          customer: {
            number: "+4901234567890"
          }
        }
      };

      const { data, error } = await supabase.functions.invoke('ai-booking', {
        body: testData
      });

      if (error) {
        setResult({ error: error.message, success: false });
      } else {
        setResult({ ...data, success: true });
      }
    } catch (err: any) {
      setResult({ error: err.message, success: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>🧪 AI Booking Function Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={testSuccessfulBooking}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              📞 Test Erfolgreiche Buchung
            </Button>
            <Button 
              onClick={testFailedBooking}
              disabled={loading}
              variant="outline"
            >
              ❌ Test Fehlgeschlagene Buchung
            </Button>
          </div>

          {loading && (
            <div className="p-4 bg-blue-50 rounded-lg">
              ⏳ Teste ai-booking Funktion...
            </div>
          )}

          {result && (
            <div className={`p-4 rounded-lg ${
              result.success && result.booking_confirmed 
                ? 'bg-green-50 border border-green-200' 
                : result.success 
                ? 'bg-yellow-50 border border-yellow-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
              
              {result.booking_confirmed && (
                <div className="mt-4 p-3 bg-green-100 rounded font-semibold text-green-800">
                  ✅ TERMIN ERFOLGREICH GEBUCHT!
                  {result.appointment_id && <div>Termin ID: {result.appointment_id}</div>}
                </div>
              )}
              
              {result.success && !result.booking_confirmed && (
                <div className="mt-4 p-3 bg-yellow-100 rounded font-semibold text-yellow-800">
                  ℹ️ Kein Termin gebucht (korrekt für fehlgeschlagene Buchung)
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingTest;