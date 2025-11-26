"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Crown, Check, Mail, ArrowLeft } from "lucide-react"
import { Link } from "@tanstack/react-router"

interface Participant {
  id: string
  name: string
  email: string
  isAdmin: boolean
}

export function InviteForm() {
  const [participants, setParticipants] = useState<Participant[]>([{ id: "1", name: "", email: "", isAdmin: true }])
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const addParticipant = () => {
    setParticipants([...participants, { id: Date.now().toString(), name: "", email: "", isAdmin: false }])
  }

  const removeParticipant = (id: string) => {
    if (participants.length <= 1) return
    const updated = participants.filter((p) => p.id !== id)
    // If removed participant was admin, make first one admin
    if (!updated.some((p) => p.isAdmin)) {
      updated[0].isAdmin = true
    }
    setParticipants(updated)
  }

  const updateParticipant = (id: string, field: keyof Participant, value: string | boolean) => {
    setParticipants(participants.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  const setAdmin = (id: string) => {
    setParticipants(participants.map((p) => ({ ...p, isAdmin: p.id === id })))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setIsSubmitted(true)
  }

  const isValid = participants.every((p) => p.name.trim() && p.email.trim())

  if (isSubmitted) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card/50 p-8 text-center backdrop-blur-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
          <Check className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="mb-2 text-2xl font-semibold text-foreground">Invites Sent!</h2>
        <p className="mb-6 text-muted-foreground">
          We've emailed session links to all participants. They can join using the link in their inbox.
        </p>
        <div className="mb-8 rounded-xl border border-border/50 bg-background/50 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>Invites sent to:</span>
          </div>
          <ul className="space-y-2">
            {participants.map((p) => (
              <li key={p.id} className="flex items-center gap-2 text-sm">
                <span className="text-foreground">{p.name}</span>
                <span className="text-muted-foreground">({p.email})</span>
                {p.isAdmin && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-500">
                    <Crown className="h-3 w-3" />
                    Admin
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex gap-3">
          <Link to="/" className="flex-1">
            <Button variant="outline" className="w-full bg-transparent">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <Button
            onClick={() => {
              setIsSubmitted(false)
              setParticipants([{ id: "1", name: "", email: "", isAdmin: true }])
            }}
            className="flex-1 bg-foreground text-background hover:bg-foreground/90"
          >
            Start Another Session
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {participants.map((participant, index) => (
          <div
            key={participant.id}
            className="group relative rounded-xl border border-border/50 bg-card/50 p-5 backdrop-blur-sm transition-colors hover:border-border"
          >
            {/* Admin badge / selector */}
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Participant {index + 1}</span>
              <button
                type="button"
                onClick={() => setAdmin(participant.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  participant.isAdmin
                    ? "bg-amber-500/10 text-amber-500"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Crown className="h-3 w-3" />
                {participant.isAdmin ? "Admin" : "Make Admin"}
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`name-${participant.id}`} className="text-sm text-muted-foreground">
                  Name
                </Label>
                <Input
                  id={`name-${participant.id}`}
                  type="text"
                  placeholder="John Doe"
                  value={participant.name}
                  onChange={(e) => updateParticipant(participant.id, "name", e.target.value)}
                  className="border-border/50 bg-background/50 focus:border-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`email-${participant.id}`} className="text-sm text-muted-foreground">
                  Email
                </Label>
                <Input
                  id={`email-${participant.id}`}
                  type="email"
                  placeholder="john@example.com"
                  value={participant.email}
                  onChange={(e) => updateParticipant(participant.id, "email", e.target.value)}
                  className="border-border/50 bg-background/50 focus:border-foreground"
                />
              </div>
            </div>

            {/* Remove button */}
            {participants.length > 1 && (
              <button
                type="button"
                onClick={() => removeParticipant(participant.id)}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive/10 text-destructive opacity-0 transition-opacity hover:bg-destructive/20 group-hover:opacity-100"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add participant button */}
      <button
        type="button"
        onClick={addParticipant}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/50 py-4 text-sm text-muted-foreground transition-colors hover:border-foreground/50 hover:text-foreground"
      >
        <Plus className="h-4 w-4" />
        Add Participant
      </button>

      {/* Submit */}
      <Button
        type="submit"
        disabled={!isValid || isLoading}
        className="w-full bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-background/30 border-t-background" />
            Sending Invites...
          </span>
        ) : (
          "Send Invites"
        )}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        Participants will receive an email with a unique link to join the session.
      </p>
    </form>
  )
}
