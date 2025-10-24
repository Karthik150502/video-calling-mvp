import LoginButton from "@/components/loginSignUpButton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
export default function VideoCallPage() {

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <Card className="mb-8 max-w-md mx-auto">
          <CardHeader>
          </CardHeader>
          <CardContent className="space-y-4">
            Welcome to Bate.io <LoginButton />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
