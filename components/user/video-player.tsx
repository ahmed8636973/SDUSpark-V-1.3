"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface VideoPlayerProps {
  videoId: string
  videoDbId: string
  userId: string
  startTime?: number
}

export function VideoPlayer({ videoId, videoDbId, userId, startTime = 0 }: VideoPlayerProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const playerRef = useRef<any>(null)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      const firstScriptTag = document.getElementsByTagName("script")[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

      window.onYouTubeIframeAPIReady = () => {
        setIsLoaded(true)
      }
    } else {
      setIsLoaded(true)
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (isLoaded && videoId) {
      playerRef.current = new window.YT.Player("youtube-player", {
        height: "400",
        width: "100%",
        videoId: videoId,
        playerVars: {
          start: startTime,
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      })
    }
  }, [isLoaded, videoId, startTime])

  const onPlayerReady = (event: any) => {
    // Player is ready
    console.log("[v0] YouTube player ready")
  }

  const onPlayerStateChange = (event: any) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      // Start tracking progress
      startProgressTracking()
    } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
      // Stop tracking and save progress
      stopProgressTracking()
      saveProgress()

      // Mark as completed if video ended
      if (event.data === window.YT.PlayerState.ENDED) {
        markAsCompleted()
      }
    }
  }

  const startProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }

    progressIntervalRef.current = setInterval(() => {
      saveProgress()
    }, 10000) // Save progress every 10 seconds
  }

  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }

  const saveProgress = async () => {
    if (!playerRef.current || !userId) return

    try {
      const currentTime = Math.floor(playerRef.current.getCurrentTime())
      const duration = Math.floor(playerRef.current.getDuration())

      await supabase.from("user_progress").upsert(
        {
          user_id: userId,
          video_id: videoDbId,
          watched_duration: currentTime,
          last_watched_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,video_id",
        },
      )

      console.log("[v0] Progress saved:", currentTime, "seconds")
    } catch (error) {
      console.error("Error saving progress:", error)
    }
  }

  const markAsCompleted = async () => {
    if (!userId) return

    try {
      await supabase.from("user_progress").upsert(
        {
          user_id: userId,
          video_id: videoDbId,
          completed: true,
          watched_duration: Math.floor(playerRef.current?.getDuration() || 0),
          last_watched_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,video_id",
        },
      )

      console.log("[v0] Video marked as completed")
    } catch (error) {
      console.error("Error marking video as completed:", error)
    }
  }

  return (
    <div className="relative w-full">
      <div className="aspect-video bg-muted rounded-lg overflow-hidden">
        {isLoaded ? (
          <div id="youtube-player" className="w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-muted-foreground">Loading video player...</div>
          </div>
        )}
      </div>
    </div>
  )
}

// Extend window object for YouTube API
declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}
