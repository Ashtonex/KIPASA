import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Mail, Phone, MapPin } from "lucide-react"
import { ContactForm } from "./contact-form" // Import the interactive client form

export default function SupportPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Contact Support</h1>
        <p className="text-muted-foreground text-lg">We're here to help with your orders and inquiries.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Contact Information */}
        <div className="space-y-6">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0">
              <CardTitle>Get in Touch</CardTitle>
              <CardDescription>Use any of these channels to reach our team in Mutare.</CardDescription>
            </CardHeader>
            <CardContent className="px-0 space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full text-primary">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Phone / WhatsApp</p>
                  <p className="text-muted-foreground">+263 77 690 5673</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Email</p>
                  <p className="text-muted-foreground">support@kipasastore.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-full text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Office</p>
                  <p className="text-muted-foreground">Mutare CBD, Zimbabwe</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support Form - Now using the interactive Client Component */}
        <Card className="shadow-lg border-primary/5">
          <CardHeader>
            <CardTitle>Send a Message</CardTitle>
            <CardDescription>Fill out the form below and we'll get back to you within 24 hours.</CardDescription>
          </CardHeader>
          <CardContent>
            <ContactForm /> 
          </CardContent>
        </Card>
      </div>
    </div>
  )
}