import {type ReactNode} from "react"

import {Button} from "@/components/ui/button"
import {cn} from "@/lib/utils"

type IconButtonProps = {
    label: string
    children: ReactNode
    className?: string
    onClick?: () => void
}

export function IconButton({label, children, className, onClick}: IconButtonProps) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={label}
            title={label}
            onClick={onClick}
            className={cn("raw-icon-button size-11 rounded-none", className)}
        >
            {children}
        </Button>
    )
}
