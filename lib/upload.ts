export async function uploadFile(
    formData: FormData, 
    onProgress?: (progress: { loaded: number; total: number }) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      
      xhr.open("POST", "/api/upload")
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          onProgress({ loaded: event.loaded, total: event.total })
        }
      }
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText)
          resolve(response.url)
        } else {
          reject(new Error("Upload failed"))
        }
      }
      
      xhr.onerror = () => reject(new Error("Upload failed"))
      
      xhr.send(formData)
    })
  }