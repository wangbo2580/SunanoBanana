export function Footer() {
  return (
    <footer className="bg-background border-t py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 text-2xl font-bold">
              <span>🍌</span>
              <span>Nano Banana</span>
            </div>

            <div className="text-sm text-muted-foreground text-center md:text-right">
              <p>© 2025 Nano Banana. All rights reserved.</p>
              <p className="mt-1">Transform any image with simple text prompts.</p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>NanoBanana is an independent AI image editor.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
