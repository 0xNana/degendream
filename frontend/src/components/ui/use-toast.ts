import * as React from "react"
import { Toast } from "@/components/ui/toast"

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast> & {
  id?: string
  title: string
  description?: string
}

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const toast = React.useCallback(
    ({ title, description, ...props }: Omit<ToastProps, "id">) => {
      const id = Math.random().toString(36).slice(2)

      setToasts((prevToasts) => [
        ...prevToasts,
        { ...props, id, title, description },
      ])

      setTimeout(() => {
        setToasts((prevToasts) =>
          prevToasts.filter((toast) => toast.id !== id)
        )
      }, 5000)
    },
    []
  )

  return { toast, toasts }
}

export type { ToastProps } 