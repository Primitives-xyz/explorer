'use client'

import { Button, ButtonVariant } from '@/components/ui/button'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { MapPin, X } from 'lucide-react'
import { useState } from 'react'

interface Props {
  onClose: () => void
}

export function SetLocationModal({ onClose }: Props) {
  const { mainProfile, isLoggedIn, setShowAuthFlow } = useCurrentWallet()
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [locationLabel, setLocationLabel] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Round to 2 decimal places for privacy (approx 1km accuracy)
          setLatitude(String(Math.round(position.coords.latitude * 100) / 100))
          setLongitude(
            String(Math.round(position.coords.longitude * 100) / 100)
          )
        },
        () => {
          setError('Unable to get location. Please enter manually.')
        }
      )
    } else {
      setError('Geolocation not supported in this browser.')
    }
  }

  const handleSave = async () => {
    if (!isLoggedIn || !mainProfile) {
      setShowAuthFlow(true)
      return
    }

    const lat = parseFloat(latitude)
    const lng = parseFloat(longitude)

    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError('Invalid coordinates')
      return
    }

    setSaving(true)
    setError('')

    try {
      const res = await fetch('/api/location/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('dynamic_authentication_token') || ''}`,
        },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          locationLabel,
          username: mainProfile.username,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }

      setSuccess(true)
      setTimeout(() => onClose(), 1500)
    } catch (e: any) {
      setError(e.message || 'Failed to save location')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card border border-border/40 rounded-md w-full max-w-md mx-4 p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-primary" />
            <h2 className="font-mono text-sm font-bold tracking-wider text-foreground uppercase">
              Set Location
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {!isLoggedIn ? (
          <div className="text-center space-y-3 py-4">
            <p className="font-mono text-xs text-muted-foreground">
              Connect your wallet to set your location
            </p>
            <Button onClick={() => setShowAuthFlow(true)}>
              Connect Wallet
            </Button>
          </div>
        ) : (
          <>
            <p className="font-mono text-xs text-muted-foreground">
              Your location is approximate and self-reported. Only city-level
              accuracy is stored for privacy.
            </p>

            {/* Auto-detect */}
            <button
              onClick={handleUseCurrentLocation}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-md border border-primary/20 bg-primary/5 font-mono text-xs text-primary hover:bg-primary/10 transition-colors"
            >
              <MapPin size={12} />
              Use my current location
            </button>

            {/* Manual inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest block mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g. 40.71"
                  className="w-full h-9 px-3 bg-background border border-border/40 rounded-md font-mono text-xs text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40"
                />
              </div>
              <div>
                <label className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest block mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g. -74.01"
                  className="w-full h-9 px-3 bg-background border border-border/40 rounded-md font-mono text-xs text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40"
                />
              </div>
            </div>

            <div>
              <label className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-widest block mb-1">
                Location Label (optional)
              </label>
              <input
                type="text"
                value={locationLabel}
                onChange={(e) => setLocationLabel(e.target.value)}
                placeholder="e.g. New York, NY"
                className="w-full h-9 px-3 bg-background border border-border/40 rounded-md font-mono text-xs text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40"
              />
            </div>

            {error && (
              <p className="font-mono text-xs text-destructive">{error}</p>
            )}

            {success && (
              <p className="font-mono text-xs text-primary">
                Location saved successfully!
              </p>
            )}

            <Button
              onClick={handleSave}
              disabled={saving || !latitude || !longitude}
              className="w-full font-mono text-xs tracking-wider"
            >
              {saving ? 'Saving...' : 'Save Location'}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
