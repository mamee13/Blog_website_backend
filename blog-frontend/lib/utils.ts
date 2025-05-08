import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://blog-website-g0gw.onrender.com/api"

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Get the token from localStorage
  const token = localStorage.getItem("jwt")

  // Set up headers with authorization if token exists
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  // Make the fetch request
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    headers,
  })

  // Handle unauthorized responses
  if (response.status === 401) {
    // Clear token and redirect to login
    localStorage.removeItem("jwt")
    window.location.href = "/auth/login"
    throw new Error("Unauthorized")
  }

  return response
}
