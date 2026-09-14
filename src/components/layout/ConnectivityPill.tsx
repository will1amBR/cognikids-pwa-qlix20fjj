import React, { useEffect, useState } from 'react'
import { offlineSyncService } from '@/lib/offlineSync'
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export const ConnectivityPill: React.FC = () => {
  const [status, setStatus] = useState(offlineSyncService.getStatus())
  const { toast } = useToast()

  useEffect(() => {
    let wasOffline = !offlineSyncService.getStatus().isOnline
    let prevSyncing = false

    const unsubscribe = offlineSyncService.subscribe((newStatus) => {
      // Toast notification when transitioning from offline/syncing to fully synced online
      if (
        (wasOffline && newStatus.isOnline) ||
        (prevSyncing && !newStatus.isSyncing && newStatus.queueLength === 0)
      ) {
        toast({
          title: 'Tudo sincronizado ✓',
          description: 'Seus dados e jogadas estão atualizados na nuvem.',
          className: 'bg-emerald-600 text-white border-none',
        })
      }
      wasOffline = !newStatus.isOnline
      prevSyncing = newStatus.isSyncing
      setStatus(newStatus)
    })

    return () => unsubscribe()
  }, [toast])

  if (status.isSyncing) {
    return (
      <div className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-sky-100 text-sky-800 rounded-full text-[10px] sm:text-xs font-semibold shadow-xs border border-sky-200 animate-pulse shrink-0">
        <RefreshCw className="w-3 h-3 animate-spin" />
        <span className="hidden sm:inline">Sincronizando… ({status.queueLength})</span>
      </div>
    )
  }

  if (!status.isOnline) {
    return (
      <div className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-amber-100 text-amber-900 rounded-full text-[10px] sm:text-xs font-semibold shadow-xs border border-amber-300 shrink-0">
        <WifiOff className="w-3 h-3 text-amber-700" />
        <span className="hidden md:inline">Modo offline</span>
      </div>
    )
  }

  if (status.queueLength > 0) {
    return (
      <button
        onClick={() => offlineSyncService.syncQueue()}
        className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-full text-[10px] sm:text-xs font-semibold shadow-xs border border-orange-200 transition-colors shrink-0"
        title="Clique para sincronizar jogadas pendentes"
      >
        <RefreshCw className="w-3 h-3" />
        <span className="hidden sm:inline">{status.queueLength} pendente(s)</span>
      </button>
    )
  }

  return null
}
