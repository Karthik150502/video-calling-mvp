import React from 'react'
import { Card, CardContent } from './ui/card'
import { AlertCircle } from 'lucide-react'


type ErrorBannerProps = {
    heading: string,
    title: string,
    description?: string | React.ReactNode
}

export default function ErrorBanner({
    heading,
    title,
    description
}: ErrorBannerProps) {
    return <Card className="mb-6 max-w-2xl mx-auto border-destructive">
        <CardContent className="pt-6">
            <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                    <h4 className="font-semibold text-destructive mb-1">{heading}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{title}</p>
                    <div className="text-xs text-muted-foreground">
                        {description}
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
}
