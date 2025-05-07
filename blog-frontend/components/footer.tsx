import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} BlogSite. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground mt-4 md:mt-0">Made by Mamaru </p>
        </div>
      </div>
    </footer>
  )
}
