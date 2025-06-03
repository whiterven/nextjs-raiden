import { tool } from "ai"
import { z } from "zod"
import * as fs from "fs/promises"
import * as fsSync from "fs"
import * as path from "path"
import JSZip from "jszip"

// Supported file extensions
const SUPPORTED_EXTENSIONS = [
  '.md', '.txt', '.py', '.tsx', '.ts', '.js', '.jsx', '.css', '.scss', '.sass',
  '.html', '.htm', '.json', '.xml', '.yaml', '.yml', '.csv', '.sql', '.sh',
  '.bash', '.bat', '.ps1', '.php', '.rb', '.go', '.rust', '.rs', '.java',
  '.c', '.cpp', '.h', '.hpp', '.swift', '.kt', '.dart', '.vue', '.svelte',
  '.astro', '.config', '.env', '.gitignore', '.dockerignore', '.dockerfile'
]

// File operation schemas
const FileOperationSchema = z.object({
  filePath: z.string().describe("Path to the file"),
  content: z.string().optional().describe("Content for the file"),
  encoding: z.enum(["utf8", "ascii", "base64", "binary"]).optional().default("utf8").describe("File encoding"),
})

const ZipOperationSchema = z.object({
  zipPath: z.string().describe("Output path for the zip file"),
  files: z.array(z.object({
    sourcePath: z.string().describe("Source file path"),
    zipPath: z.string().optional().describe("Path inside zip (defaults to filename)")
  })).describe("Files to include in zip"),
  directories: z.array(z.string()).optional().describe("Directories to include recursively"),
})

export const fileManager = tool({
  description: "Comprehensive file management tool for reading, creating, updating, and zipping files",
  parameters: z.object({
    operation: z.enum([
      "read", "create", "update", "delete", "exists", "list", 
      "createDirectory", "zip", "unzip", "copy", "move"
    ]).describe("File operation to perform"),
    
    // Single file operations
    filePath: z.string().optional().describe("Path to the file"),
    content: z.string().optional().describe("Content for the file"),
    encoding: z.enum(["utf8", "ascii", "base64", "binary"]).optional().default("utf8"),
    
    // Directory operations
    directoryPath: z.string().optional().describe("Path to directory"),
    recursive: z.boolean().optional().default(false).describe("Recursive operation"),
    
    // Zip operations
    zipPath: z.string().optional().describe("Path for zip file"),
    files: z.array(z.object({
      sourcePath: z.string(),
      zipPath: z.string().optional()
    })).optional().describe("Files to zip"),
    directories: z.array(z.string()).optional().describe("Directories to zip"),
    
    // Copy/Move operations
    sourcePath: z.string().optional().describe("Source path for copy/move"),
    destinationPath: z.string().optional().describe("Destination path for copy/move"),
    
    // Additional options
    createDirectories: z.boolean().optional().default(true).describe("Create directories if they don't exist"),
    overwrite: z.boolean().optional().default(false).describe("Overwrite existing files"),
    onProgress: z.function().optional().describe("Progress callback"),
  }),
  
  execute: async ({
    operation,
    filePath,
    content,
    encoding = "utf8",
    directoryPath,
    recursive = false,
    zipPath,
    files,
    directories,
    sourcePath,
    destinationPath,
    createDirectories = true,
    overwrite = false,
    onProgress
  }) => {
    try {
      // Progress callback helper
      const reportProgress = (message: string, progress?: number) => {
        if (onProgress) {
          onProgress({ message, progress, operation })
        }
      }

      switch (operation) {
        case "read":
          if (!filePath) throw new Error("filePath is required for read operation")
          
          reportProgress(`Reading file: ${filePath}`)
          
          if (!fsSync.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`)
          }
          
          const fileContent = await fs.readFile(filePath, encoding)
          const stats = await fs.stat(filePath)
          
          return {
            success: true,
            operation: "read",
            filePath,
            content: fileContent,
            size: stats.size,
            modified: stats.mtime,
            encoding
          }

        case "create":
          if (!filePath || content === undefined) {
            throw new Error("filePath and content are required for create operation")
          }
          
          reportProgress(`Creating file: ${filePath}`)
          
          // Check if file exists and overwrite setting
          if (fsSync.existsSync(filePath) && !overwrite) {
            throw new Error(`File already exists: ${filePath}. Use overwrite: true to replace it.`)
          }
          
          // Create directories if needed
          if (createDirectories) {
            const dir = path.dirname(filePath)
            await fs.mkdir(dir, { recursive: true })
          }
          
          // Validate file extension
          const ext = path.extname(filePath).toLowerCase()
          if (ext && !SUPPORTED_EXTENSIONS.includes(ext)) {
            console.warn(`Warning: ${ext} is not in the list of commonly supported extensions`)
          }
          
          await fs.writeFile(filePath, content, encoding)
          const newStats = await fs.stat(filePath)
          
          return {
            success: true,
            operation: "create",
            filePath,
            size: newStats.size,
            created: newStats.birthtime,
            encoding
          }

        case "update":
          if (!filePath || content === undefined) {
            throw new Error("filePath and content are required for update operation")
          }
          
          reportProgress(`Updating file: ${filePath}`)
          
          if (!fsSync.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`)
          }
          
          await fs.writeFile(filePath, content, encoding)
          const updatedStats = await fs.stat(filePath)
          
          return {
            success: true,
            operation: "update",
            filePath,
            size: updatedStats.size,
            modified: updatedStats.mtime,
            encoding
          }

        case "delete":
          if (!filePath) throw new Error("filePath is required for delete operation")
          
          reportProgress(`Deleting file: ${filePath}`)
          
          if (!fsSync.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`)
          }
          
          await fs.unlink(filePath)
          
          return {
            success: true,
            operation: "delete",
            filePath
          }

        case "exists":
          if (!filePath) throw new Error("filePath is required for exists operation")
          
          const exists = fsSync.existsSync(filePath)
          let fileStats = null
          
          if (exists) {
            fileStats = await fs.stat(filePath)
          }
          
          return {
            success: true,
            operation: "exists",
            filePath,
            exists,
            isFile: exists ? fileStats?.isFile() : false,
            isDirectory: exists ? fileStats?.isDirectory() : false,
            size: exists ? fileStats?.size : null,
            modified: exists ? fileStats?.mtime : null
          }

        case "list":
          if (!directoryPath) throw new Error("directoryPath is required for list operation")
          
          reportProgress(`Listing directory: ${directoryPath}`)
          
          if (!fsSync.existsSync(directoryPath)) {
            throw new Error(`Directory not found: ${directoryPath}`)
          }
          
          const listFiles = async (dir: string, isRecursive: boolean = false): Promise<any[]> => {
            const items = await fs.readdir(dir, { withFileTypes: true })
            const result = []
            
            for (const item of items) {
              const fullPath = path.join(dir, item.name)
              const relativePath = path.relative(directoryPath, fullPath)
              const stats = await fs.stat(fullPath)
              
              const fileInfo = {
                name: item.name,
                path: fullPath,
                relativePath,
                isFile: item.isFile(),
                isDirectory: item.isDirectory(),
                size: stats.size,
                modified: stats.mtime,
                extension: item.isFile() ? path.extname(item.name) : null
              }
              
              result.push(fileInfo)
              
              if (item.isDirectory() && isRecursive) {
                const subItems = await listFiles(fullPath, true)
                result.push(...subItems)
              }
            }
            
            return result
          }
          
          const items = await listFiles(directoryPath, recursive)
          
          return {
            success: true,
            operation: "list",
            directoryPath,
            recursive,
            itemCount: items.length,
            items
          }

        case "createDirectory":
          if (!directoryPath) throw new Error("directoryPath is required for createDirectory operation")
          
          reportProgress(`Creating directory: ${directoryPath}`)
          
          await fs.mkdir(directoryPath, { recursive: recursive })
          
          return {
            success: true,
            operation: "createDirectory",
            directoryPath,
            recursive
          }

        case "zip":
          if (!zipPath || (!files && !directories)) {
            throw new Error("zipPath and either files or directories are required for zip operation")
          }
          
          reportProgress("Creating zip file...")
          
          const zip = new JSZip()
          let fileCount = 0
          
          // Add individual files
          if (files) {
            for (let i = 0; i < files.length; i++) {
              const file = files[i]
              reportProgress(`Adding file ${i + 1}/${files.length}: ${file.sourcePath}`, (i / files.length) * 50)
              
              if (!fsSync.existsSync(file.sourcePath)) {
                console.warn(`Warning: File not found, skipping: ${file.sourcePath}`)
                continue
              }
              
              const fileContent = await fs.readFile(file.sourcePath)
              const zipFilePath = file.zipPath || path.basename(file.sourcePath)
              zip.file(zipFilePath, fileContent)
              fileCount++
            }
          }
          
          // Add directories recursively
          if (directories) {
            const addDirectory = async (dirPath: string, zipPrefix: string = "") => {
              const items = await fs.readdir(dirPath, { withFileTypes: true })
              
              for (const item of items) {
                const fullPath = path.join(dirPath, item.name)
                const zipPath = path.join(zipPrefix, item.name).replace(/\\/g, '/')
                
                if (item.isFile()) {
                  const fileContent = await fs.readFile(fullPath)
                  zip.file(zipPath, fileContent)
                  fileCount++
                } else if (item.isDirectory()) {
                  await addDirectory(fullPath, zipPath)
                }
              }
            }
            
            for (const dir of directories) {
              if (fsSync.existsSync(dir)) {
                reportProgress(`Adding directory: ${dir}`)
                await addDirectory(dir, path.basename(dir))
              }
            }
          }
          
          reportProgress("Generating zip file...", 75)
          
          // Create zip directories if needed
          if (createDirectories) {
            const zipDir = path.dirname(zipPath)
            await fs.mkdir(zipDir, { recursive: true })
          }
          
          const zipBuffer = await zip.generateAsync({ type: "nodebuffer" })
          await fs.writeFile(zipPath, zipBuffer)
          
          reportProgress("Zip file created successfully!", 100)
          
          return {
            success: true,
            operation: "zip",
            zipPath,
            fileCount,
            size: zipBuffer.length
          }

        case "copy":
          if (!sourcePath || !destinationPath) {
            throw new Error("sourcePath and destinationPath are required for copy operation")
          }
          
          reportProgress(`Copying ${sourcePath} to ${destinationPath}`)
          
          if (!fsSync.existsSync(sourcePath)) {
            throw new Error(`Source not found: ${sourcePath}`)
          }
          
          if (createDirectories) {
            const destDir = path.dirname(destinationPath)
            await fs.mkdir(destDir, { recursive: true })
          }
          
          await fs.copyFile(sourcePath, destinationPath)
          
          return {
            success: true,
            operation: "copy",
            sourcePath,
            destinationPath
          }

        case "move":
          if (!sourcePath || !destinationPath) {
            throw new Error("sourcePath and destinationPath are required for move operation")
          }
          
          reportProgress(`Moving ${sourcePath} to ${destinationPath}`)
          
          if (!fsSync.existsSync(sourcePath)) {
            throw new Error(`Source not found: ${sourcePath}`)
          }
          
          if (createDirectories) {
            const destDir = path.dirname(destinationPath)
            await fs.mkdir(destDir, { recursive: true })
          }
          
          await fs.rename(sourcePath, destinationPath)
          
          return {
            success: true,
            operation: "move",
            sourcePath,
            destinationPath
          }

        default:
          throw new Error(`Unsupported operation: ${operation}`)
      }
      
    } catch (error) {
      return {
        success: false,
        operation,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: new Date().toISOString()
      }
    }
  }
})

// Export helper functions for easier usage
export const fileHelpers = {
  // Quick file operations
  readFile: (filePath: string, encoding: "utf8" | "ascii" | "base64" | "binary" = "utf8") =>
    fileManager.execute({ 
      operation: "read", 
      filePath, 
      encoding,
      recursive: false,
      createDirectories: false,
      overwrite: false
    }, { toolCallId: "file-read", messages: [] }),
    
  createFile: (filePath: string, content: string, options?: { overwrite?: boolean, encoding?: "utf8" | "ascii" | "base64" | "binary" }) =>
    fileManager.execute({ 
      operation: "create", 
      filePath, 
      content, 
      encoding: options?.encoding || "utf8",
      recursive: false,
      createDirectories: true,
      overwrite: options?.overwrite || false
    }, { toolCallId: "file-create", messages: [] }),
    
  updateFile: (filePath: string, content: string, encoding: "utf8" | "ascii" | "base64" | "binary" = "utf8") =>
    fileManager.execute({ 
      operation: "update", 
      filePath, 
      content, 
      encoding,
      recursive: false,
      createDirectories: false,
      overwrite: true
    }, { toolCallId: "file-update", messages: [] }),
    
  deleteFile: (filePath: string) =>
    fileManager.execute({ 
      operation: "delete", 
      filePath,
      encoding: "utf8",
      recursive: false,
      createDirectories: false,
      overwrite: false
    }, { toolCallId: "file-delete", messages: [] }),
    
  fileExists: (filePath: string) =>
    fileManager.execute({ 
      operation: "exists", 
      filePath,
      encoding: "utf8",
      recursive: false,
      createDirectories: false,
      overwrite: false
    }, { toolCallId: "file-exists", messages: [] }),
    
  listDirectory: (directoryPath: string, recursive: boolean = false) =>
    fileManager.execute({ 
      operation: "list", 
      directoryPath, 
      recursive,
      encoding: "utf8",
      createDirectories: false,
      overwrite: false
    }, { toolCallId: "dir-list", messages: [] }),
    
  createDirectory: (directoryPath: string, recursive: boolean = true) =>
    fileManager.execute({ 
      operation: "createDirectory", 
      directoryPath, 
      recursive,
      encoding: "utf8",
      createDirectories: true,
      overwrite: false
    }, { toolCallId: "dir-create", messages: [] }),
    
  // Zip operations
  createZip: (zipPath: string, files: Array<{sourcePath: string, zipPath?: string}>, directories?: string[]) =>
    fileManager.execute({ 
      operation: "zip", 
      zipPath, 
      files, 
      directories,
      encoding: "utf8",
      recursive: true,
      createDirectories: true,
      overwrite: false
    }, { toolCallId: "zip-create", messages: [] }),
    
  // File system operations
  copyFile: (sourcePath: string, destinationPath: string) =>
    fileManager.execute({ 
      operation: "copy", 
      sourcePath, 
      destinationPath,
      encoding: "utf8",
      recursive: false,
      createDirectories: true,
      overwrite: false
    }, { toolCallId: "file-copy", messages: [] }),
    
  moveFile: (sourcePath: string, destinationPath: string) =>
    fileManager.execute({ 
      operation: "move", 
      sourcePath, 
      destinationPath,
      encoding: "utf8",
      recursive: false,
      createDirectories: true,
      overwrite: true
    }, { toolCallId: "file-move", messages: [] })
}

// Type definitions for better TypeScript support
export interface FileInfo {
  name: string
  path: string
  relativePath: string
  isFile: boolean
  isDirectory: boolean
  size: number
  modified: Date
  extension: string | null
}

export interface FileOperationResult {
  success: boolean
  operation: string
  error?: string
  timestamp?: string
  [key: string]: any
}