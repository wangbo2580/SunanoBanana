"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, ImageIcon, Sparkles, Loader2, Download, X } from "lucide-react"

interface GeneratedImage {
  type: string
  image_url: {
    url: string
  }
}

export function Generator() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [responseText, setResponseText] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB")
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        setError(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerate = async () => {
    if (!selectedImage) {
      setError("Please upload an image first")
      return
    }
    if (!prompt.trim()) {
      setError("Please enter a prompt")
      return
    }

    setIsGenerating(true)
    setError(null)
    setGeneratedImages([])
    setResponseText("")

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: selectedImage, prompt: prompt.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate image")
      }

      if (data.images && data.images.length > 0) {
        setGeneratedImages(data.images)
      }
      if (data.text) {
        setResponseText(data.text)
      }

      // If no images and no text, show error
      if ((!data.images || data.images.length === 0) && !data.text) {
        setError("No image was generated. Please try a different prompt.")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while generating the image")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = (imageUrl: string, index: number) => {
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = `nano-banana-${Date.now()}-${index}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const clearImage = () => {
    setSelectedImage(null)
    setGeneratedImages([])
    setResponseText("")
    setError(null)
  }

  return (
    <section id="generator" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold text-balance">Get Started</h2>
            <p className="text-lg text-muted-foreground text-balance">
              Experience the power of nano-banana's natural language image editing. Transform any photo with simple text
              commands.
            </p>
          </div>

          <Card className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Upload Section */}
              <div className="space-y-6">
                <div>
                  <Label className="text-lg font-semibold mb-4 block">Reference Image</Label>
                  <div
                    className="relative border-2 border-dashed rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/30"
                    onClick={() => document.getElementById("image-upload")?.click()}
                  >
                    {selectedImage ? (
                      <>
                        <img
                          src={selectedImage}
                          alt="Uploaded"
                          className="max-w-full h-48 mx-auto object-contain rounded"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            clearImage()
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                        <div>
                          <p className="font-medium">Click to upload image</p>
                          <p className="text-sm text-muted-foreground mt-1">Max 10MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>

                <div>
                  <Label htmlFor="prompt" className="text-lg font-semibold mb-4 block">
                    Main Prompt
                  </Label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe your desired edits... e.g., 'place the subject in a snowy mountain scene' or 'add a sunset background'"
                    className="min-h-32 resize-none"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isGenerating}
                  />
                </div>

                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                    {error}
                  </div>
                )}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleGenerate}
                  disabled={isGenerating || !selectedImage || !prompt.trim()}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Now
                    </>
                  )}
                </Button>
              </div>

              {/* Output Section */}
              <div className="space-y-6">
                <div>
                  <Label className="text-lg font-semibold mb-4 block">Output Gallery</Label>
                  <div className="border-2 rounded-lg p-6 bg-muted/30 min-h-[300px]">
                    {isGenerating ? (
                      <div className="flex flex-col items-center justify-center h-full min-h-[250px]">
                        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                        <p className="text-lg font-medium">Generating your image...</p>
                        <p className="text-sm text-muted-foreground mt-2">This may take a few moments</p>
                      </div>
                    ) : generatedImages.length > 0 || responseText ? (
                      <div className="space-y-4">
                        {generatedImages.map((img, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={img.image_url.url}
                              alt={`Generated ${index + 1}`}
                              className="w-full rounded-lg shadow-lg"
                            />
                            <Button
                              size="sm"
                              className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDownload(img.image_url.url, index)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        ))}
                        {responseText && (
                          <div className="p-4 bg-background rounded-lg border">
                            <p className="text-sm text-muted-foreground">{responseText}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full min-h-[250px]">
                        <ImageIcon className="w-16 h-16 text-muted-foreground mb-4" />
                        <p className="text-lg font-medium">Your ultra-fast AI creations appear here</p>
                        <p className="text-sm text-muted-foreground mt-2">Ready for instant generation</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-primary/10 rounded-lg text-center">
                  <p className="text-sm font-medium">Want more powerful image generation features?</p>
                  <Button variant="link" className="text-primary">
                    Visit Full Generator →
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
