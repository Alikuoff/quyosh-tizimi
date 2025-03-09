/**
 * This file provides procedural texture generation for planets
 * for realistic planet visualization without requiring texture files
 */

import { CanvasTexture, Color } from "three"

interface PlanetTextureOptions {
  baseColor: string
  noiseIntensity?: number
  resolution?: number
  type?: "rocky" | "gas" | "sun" | "rings" | "earth" | "mars" | "venus" | "mercury"
  rings?: boolean
  detail?: number
}

// Improved noise function for more natural patterns
function improvedNoise(x: number, y: number, z: number): number {
  // Simple Perlin-like noise function
  function fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }
  function lerp(t: number, a: number, b: number): number {
    return a + t * (b - a)
  }

  const p = new Array(512)
  const permutation = [
    151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240,
    21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88,
    237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83,
    111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80,
    73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64,
    52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182,
    189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22,
    39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210,
    144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84,
    204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78,
    66, 215, 61, 156, 180,
  ]

  for (let i = 0; i < 256; i++) {
    p[i] = permutation[i]
    p[256 + i] = permutation[i]
  }

  const X = Math.floor(x) & 255
  const Y = Math.floor(y) & 255
  const Z = Math.floor(z) & 255

  x -= Math.floor(x)
  y -= Math.floor(y)
  z -= Math.floor(z)

  const u = fade(x)
  const v = fade(y)
  const w = fade(z)

  const A = p[X] + Y,
    AA = p[A] + Z,
    AB = p[A + 1] + Z
  const B = p[X + 1] + Y,
    BA = p[B] + Z,
    BB = p[B + 1] + Z

  // Hash the coordinates of the 8 cube corners
  const hash1 = p[AA] & 15
  const hash2 = p[BA] & 15
  const hash3 = p[AB] & 15
  const hash4 = p[BB] & 15
  const hash5 = p[AA + 1] & 15
  const hash6 = p[BA + 1] & 15
  const hash7 = p[AB + 1] & 15
  const hash8 = p[BB + 1] & 15

  // Using hash to determine gradient directions
  const g1 =
    ((hash1 & 1) === 0 ? (hash1 < 8 ? x : y) : hash1 < 8 ? -x : -y) +
    ((hash1 & 2) === 0 ? (hash1 < 4 ? y : z) : hash1 < 4 ? -y : -z)
  const g2 =
    ((hash2 & 1) === 0 ? (hash2 < 8 ? x - 1 : y) : hash2 < 8 ? -(x - 1) : -y) +
    ((hash2 & 2) === 0 ? (hash2 < 4 ? y : z) : hash2 < 4 ? -y : -z)
  const g3 =
    ((hash3 & 1) === 0 ? (hash3 < 8 ? x : y - 1) : hash3 < 8 ? -x : -(y - 1)) +
    ((hash3 & 2) === 0 ? (hash3 < 4 ? y - 1 : z) : hash3 < 4 ? -(y - 1) : -z)
  const g4 =
    ((hash4 & 1) === 0 ? (hash4 < 8 ? x - 1 : y - 1) : hash4 < 8 ? -(x - 1) : -(y - 1)) +
    ((hash4 & 2) === 0 ? (hash4 < 4 ? y - 1 : z) : hash4 < 4 ? -(y - 1) : -z)
  const g5 =
    ((hash5 & 1) === 0 ? (hash5 < 8 ? x : y) : hash5 < 8 ? -x : -y) +
    ((hash5 & 2) === 0 ? (hash5 < 4 ? y : z - 1) : hash5 < 4 ? -y : -(z - 1))
  const g6 =
    ((hash6 & 1) === 0 ? (hash6 < 8 ? x - 1 : y) : hash6 < 8 ? -(x - 1) : -y) +
    ((hash6 & 2) === 0 ? (hash6 < 4 ? y : z - 1) : hash6 < 4 ? -y : -(z - 1))
  const g7 =
    ((hash7 & 1) === 0 ? (hash7 < 8 ? x : y - 1) : hash7 < 8 ? -x : -(y - 1)) +
    ((hash7 & 2) === 0 ? (hash7 < 4 ? y - 1 : z - 1) : hash7 < 4 ? -(y - 1) : -(z - 1))
  const g8 =
    ((hash8 & 1) === 0 ? (hash8 < 8 ? x - 1 : y - 1) : hash8 < 8 ? -(x - 1) : -(y - 1)) +
    ((hash8 & 2) === 0 ? (hash8 < 4 ? y - 1 : z - 1) : hash8 < 4 ? -(y - 1) : -(z - 1))

  // Interpolate the results
  const v1 = lerp(u, g1, g2)
  const v2 = lerp(u, g3, g4)
  const v3 = lerp(u, g5, g6)
  const v4 = lerp(u, g7, g8)

  const v5 = lerp(v, v1, v2)
  const v6 = lerp(v, v3, v4)

  return (lerp(w, v5, v6) + 1) / 2 // Scale to 0..1
}

// Function to create fractal noise for more detail
function fractalNoise(x: number, y: number, z: number, octaves: number, persistence: number): number {
  let total = 0
  let frequency = 1
  let amplitude = 1
  let maxValue = 0

  for (let i = 0; i < octaves; i++) {
    total += improvedNoise(x * frequency, y * frequency, z * frequency) * amplitude
    maxValue += amplitude
    amplitude *= persistence
    frequency *= 2
  }

  return total / maxValue
}

// Add this function to create a realistic moon texture
function createMoonTexture(
  ctx: CanvasRenderingContext2D,
  resolution: number,
  baseColor: string,
  noiseIntensity: number,
  detail: number,
) {
  const moonColor = new Color("#c8c8c8") // Base gray color
  const darkColor = new Color("#505050") // Dark crater color
  const lightColor = new Color("#e0e0e0") // Light highland color
  const craterRimColor = new Color("#d0d0d0") // Bright crater rims

  // Fill with base color
  ctx.fillStyle = moonColor.getStyle()
  ctx.fillRect(0, 0, resolution, resolution)

  const imageData = ctx.getImageData(0, 0, resolution, resolution)
  const data = imageData.data

  // Create heavily cratered Moon surface
  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      // Convert to spherical coordinates
      const u = x / resolution
      const v = y / resolution
      const theta = u * Math.PI * 2
      const phi = v * Math.PI

      // Convert to 3D coordinates on sphere
      const xPos = Math.sin(phi) * Math.cos(theta)
      const yPos = Math.sin(phi) * Math.sin(theta)
      const zPos = Math.cos(phi)

      // Multi-scale noise for different crater sizes and terrain
      const largeFeatures = fractalNoise(xPos * detail * 0.5, yPos * detail * 0.5, zPos * detail * 0.5, 4, 0.5)
      const mediumCraters = fractalNoise(xPos * detail * 2, yPos * detail * 2, zPos * detail * 2, 5, 0.6)
      const smallCraters = fractalNoise(xPos * detail * 6, yPos * detail * 6, zPos * detail * 6, 3, 0.7)

      // Determine terrain type
      const combinedTerrain = largeFeatures * 0.4 + mediumCraters * 0.4 + smallCraters * 0.2

      // Determine pixel color
      let pixelColor

      // Lots of crater features
      if (mediumCraters > 0.7 && smallCraters > 0.6) {
        // Crater rims
        pixelColor = craterRimColor.clone()
      } else if (mediumCraters < 0.3 && smallCraters < 0.4) {
        // Crater floors
        pixelColor = darkColor.clone()
      } else if (largeFeatures > 0.6) {
        // Highlands (maria)
        pixelColor = lightColor.clone()
      } else {
        // General terrain
        pixelColor = moonColor.clone()
        // Add some variation
        pixelColor.offsetHSL(0, 0, (combinedTerrain - 0.5) * 0.2)
      }

      // Set pixel color
      const i = (y * resolution + x) * 4
      data[i] = pixelColor.r * 255
      data[i + 1] = pixelColor.g * 255
      data[i + 2] = pixelColor.b * 255
      data[i + 3] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)

  // Add major impact craters
  for (let i = 0; i < 35; i++) {
    // More craters for the moon
    const craterX = Math.random() * resolution
    const craterY = Math.random() * resolution
    const craterSize = Math.random() * resolution * 0.1 + resolution * 0.02

    // Crater floor
    ctx.fillStyle = darkColor.getStyle()
    ctx.beginPath()
    ctx.arc(craterX, craterY, craterSize, 0, Math.PI * 2)
    ctx.fill()

    // Crater rim
    ctx.strokeStyle = craterRimColor.getStyle()
    ctx.lineWidth = craterSize * 0.15
    ctx.beginPath()
    ctx.arc(craterX, craterY, craterSize * 0.9, 0, Math.PI * 2)
    ctx.stroke()

    // Ejecta rays for some larger craters (like Tycho)
    if (craterSize > resolution * 0.05 && Math.random() > 0.7) {
      const rayCount = Math.floor(Math.random() * 8) + 6
      const rayLength = craterSize * (Math.random() * 8 + 6) // Longer rays for the moon

      for (let ray = 0; ray < rayCount; ray++) {
        const angle = ray * ((Math.PI * 2) / rayCount) + Math.random() * 0.5
        const rayX = craterX + Math.cos(angle) * (craterSize + rayLength * 0.5)
        const rayY = craterY + Math.sin(angle) * (craterSize + rayLength * 0.5)

        // Create ray gradient
        const rayGradient = ctx.createLinearGradient(craterX, craterY, rayX, rayY)

        rayGradient.addColorStop(0, "rgba(220, 220, 220, 0.7)")
        rayGradient.addColorStop(0.5, "rgba(220, 220, 220, 0.3)")
        rayGradient.addColorStop(1, "transparent")

        ctx.fillStyle = rayGradient
        ctx.beginPath()

        // Draw tapered ray
        const rayWidth = craterSize * 0.4

        ctx.moveTo(craterX, craterY)
        ctx.lineTo(craterX + Math.cos(angle - 0.2) * craterSize, craterY + Math.sin(angle - 0.2) * craterSize)
        ctx.lineTo(rayX + Math.cos(angle + 0.1) * rayWidth, rayY + Math.sin(angle + 0.1) * rayWidth)
        ctx.lineTo(rayX + Math.cos(angle - 0.1) * rayWidth, rayY + Math.sin(angle - 0.1) * rayWidth)
        ctx.lineTo(craterX + Math.cos(angle + 0.2) * craterSize, craterY + Math.sin(angle + 0.2) * craterSize)
        ctx.closePath()
        ctx.fill()
      }
    }
  }

  // Add the major maria (dark areas) of the moon
  const mariaAreas = [
    { x: resolution * 0.3, y: resolution * 0.3, size: resolution * 0.15 },
    { x: resolution * 0.6, y: resolution * 0.4, size: resolution * 0.12 },
    { x: resolution * 0.5, y: resolution * 0.7, size: resolution * 0.1 },
  ]

  for (const maria of mariaAreas) {
    ctx.fillStyle = "rgba(80, 80, 80, 0.4)"
    ctx.beginPath()
    ctx.arc(maria.x, maria.y, maria.size, 0, Math.PI * 2)
    ctx.fill()
  }
}

// Enhance the createProceduralPlanetTexture function to make planets brighter and more realistic
function createProceduralPlanetTexture({
  baseColor = "#ffffff",
  noiseIntensity = 0.5,
  resolution = 1024, // Increased resolution for more detail
  type = "rocky",
  detail = 4,
}: PlanetTextureOptions): CanvasTexture {
  // Create canvas element
  const canvas = document.createElement("canvas")
  canvas.width = resolution
  canvas.height = resolution
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    console.error("Could not get canvas context")
    return new CanvasTexture(canvas)
  }

  // Fill with base color
  ctx.fillStyle = baseColor
  ctx.fillRect(0, 0, resolution, resolution)

  // Different patterns based on planet type
  if (type === "rocky") {
    // Check if it's the moon based on the color
    if (baseColor === "#c8c8c8") {
      createMoonTexture(ctx, resolution, baseColor, noiseIntensity, detail)
    } else {
      createRockyTexture(ctx, resolution, baseColor, noiseIntensity, detail)
    }
  } else if (type === "gas") {
    createGasTexture(ctx, resolution, baseColor, noiseIntensity, detail)
  } else if (type === "sun") {
    createSunTexture(ctx, resolution, baseColor, detail)
  } else if (type === "rings") {
    createRingsTexture(ctx, resolution, baseColor, detail)
  } else if (type === "earth") {
    createEarthTexture(ctx, resolution, baseColor, noiseIntensity, detail)
  } else if (type === "mars") {
    createMarsTexture(ctx, resolution, baseColor, noiseIntensity, detail)
  } else if (type === "venus") {
    createVenusTexture(ctx, resolution, baseColor, noiseIntensity, detail)
  } else if (type === "mercury") {
    createMercuryTexture(ctx, resolution, baseColor, noiseIntensity, detail)
  }

  // Apply final brightness and contrast adjustments for more vibrant appearance
  applyBrightnessContrast(ctx, resolution, type)

  // Create and return texture
  return new CanvasTexture(canvas)
}

// Add a new function to enhance brightness and contrast
function applyBrightnessContrast(ctx: CanvasRenderingContext2D, resolution: number, type: string) {
  const imageData = ctx.getImageData(0, 0, resolution, resolution)
  const data = imageData.data

  // Different adjustments based on planet type
  let brightnessAdjust = 0.1 // Default slight brightness increase
  let contrastAdjust = 0.2 // Default contrast increase

  if (type === "sun") {
    brightnessAdjust = 0.2
    contrastAdjust = 0.1
  } else if (type === "gas") {
    brightnessAdjust = 0.15
    contrastAdjust = 0.25
  } else if (type === "earth") {
    brightnessAdjust = 0.12
    contrastAdjust = 0.3
  } else if (type === "mars") {
    brightnessAdjust = 0.15
    contrastAdjust = 0.35
  }

  // Apply adjustments
  for (let i = 0; i < data.length; i += 4) {
    // Brightness adjustment
    data[i] = Math.min(255, data[i] * (1 + brightnessAdjust))
    data[i + 1] = Math.min(255, data[i + 1] * (1 + brightnessAdjust))
    data[i + 2] = Math.min(255, data[i + 2] * (1 + brightnessAdjust))

    // Contrast adjustment (simplified algorithm)
    const factor = (259 * (contrastAdjust + 1)) / (255 * (1 - contrastAdjust))
    data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128))
    data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128))
    data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128))
  }

  ctx.putImageData(imageData, 0, 0)
}

function createRockyTexture(
  ctx: CanvasRenderingContext2D,
  resolution: number,
  baseColor: string,
  noiseIntensity: number,
  detail: number,
) {
  const baseColorObj = new Color(baseColor)
  const darkColor = baseColorObj.clone().multiplyScalar(0.7).getStyle()
  const lightColor = baseColorObj.clone().multiplyScalar(1.2).getStyle()

  // Create a more detailed surface with fractal noise
  const imageData = ctx.getImageData(0, 0, resolution, resolution)
  const data = imageData.data

  // Draw base terrain
  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      // Calculate spherical coordinates for wrap-around
      // Convert to polar coordinates
      const u = x / resolution
      const v = y / resolution
      const theta = u * Math.PI * 2
      const phi = v * Math.PI

      // Convert to 3D coordinates on sphere
      const xPos = Math.sin(phi) * Math.cos(theta)
      const yPos = Math.sin(phi) * Math.sin(theta)
      const zPos = Math.cos(phi)

      // Generate fractal noise
      const noiseValue = fractalNoise(xPos * detail, yPos * detail, zPos * detail, 6, 0.5)

      // Apply noise to base color
      const pixelColor = new Color(baseColor)
      pixelColor.offsetHSL(0, 0, (noiseValue - 0.5) * noiseIntensity * 2)

      // Add craters
      const craterNoise = fractalNoise(xPos * detail * 2, yPos * detail * 2, zPos * detail * 2, 3, 0.7)
      if (craterNoise > 0.7 && craterNoise < 0.75) {
        pixelColor.offsetHSL(0, 0, -0.2)
      }

      // Set pixel color
      const i = (y * resolution + x) * 4
      data[i] = pixelColor.r * 255
      data[i + 1] = pixelColor.g * 255
      data[i + 2] = pixelColor.b * 255
      data[i + 3] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)

  // Add some larger features/craters
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * resolution
    const y = Math.random() * resolution
    const size = Math.random() * (resolution / 10) + resolution / 30

    ctx.fillStyle = darkColor
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()

    // Add highlight on one side for 3D effect
    const gradient = ctx.createRadialGradient(x - size / 4, y - size / 4, 0, x - size / 4, y - size / 4, size / 2)
    gradient.addColorStop(0, lightColor)
    gradient.addColorStop(1, "transparent")

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x - size / 4, y - size / 4, size / 2, 0, Math.PI * 2)
    ctx.fill()
  }
}

// Enhance the createGasTexture function for more realistic gas giants
function createGasTexture(
  ctx: CanvasRenderingContext2D,
  resolution: number,
  baseColor: string,
  noiseIntensity: number,
  detail: number,
) {
  const baseColorObj = new Color(baseColor)
  const imageData = ctx.getImageData(0, 0, resolution, resolution)
  const data = imageData.data

  // Determine if this is a Jupiter-like or Neptune-like planet
  const isJupiterLike = baseColorObj.r > baseColorObj.b

  // Create a seamless wrapping texture
  for (let y = 0; y < resolution; y++) {
    // Normalize y to 0-1
    const v = y / resolution

    // Calculate band location - several horizontal bands
    const bandCount = isJupiterLike ? 12 : 8
    const band = Math.floor(v * bandCount) % bandCount

    // Alternate band colors
    const baseHue = new Color(baseColor).getHSL({ h: 0, s: 0, l: 0 }).h

    for (let x = 0; x < resolution; x++) {
      // Normalize x to 0-1
      const u = x / resolution

      // Create turbulence in the bands using noise
      const xPos = Math.cos(u * Math.PI * 2)
      const yPos = Math.sin(u * Math.PI * 2)
      const zPos = v * 2 - 1

      // Multiple noise layers for detail
      const noise1 = fractalNoise(xPos * detail, yPos * detail, zPos * detail, 4, 0.5)
      const noise2 = fractalNoise(xPos * detail * 2, yPos * detail * 2, zPos * detail * 3, 2, 0.7)
      const noise3 = fractalNoise(xPos * detail * 4, yPos * detail * 4, zPos * detail * 5, 2, 0.8)

      // Combine noise for turbulence
      const turbulence = (noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2) * noiseIntensity * 1.5

      // Create horizontal band effect
      const bandOffset = Math.sin((band / bandCount) * Math.PI * 2) * 0.15

      // Calculate color based on band and turbulence
      const pixelColor = new Color()
      const hue = baseHue + bandOffset + turbulence * 0.08

      // Alternate bands have different saturation/lightness
      const saturation = 0.7 + (band % 2) * 0.2 + turbulence * 0.15
      const lightness = 0.55 + bandOffset * 0.5 + turbulence * 0.15

      pixelColor.setHSL(hue, saturation, lightness)

      // Add storm features
      if (noise2 > 0.85 && Math.random() > 0.97) {
        // Create oval storm like Jupiter's Great Red Spot or white ovals
        const stormSize = Math.random() * 20 + 10
        const stormX = x
        const stormY = y

        if (stormX >= 0 && stormX < resolution && stormY >= 0 && stormY < resolution) {
          ctx.save()
          // Create oval storm
          ctx.beginPath()
          ctx.ellipse(stormX, stormY, stormSize, stormSize * 0.6, 0, 0, Math.PI * 2)

          // Color depends on planet type
          if (isJupiterLike) {
            // Jupiter-like: red/brown storms
            ctx.fillStyle = "rgba(196, 116, 48, 0.8)"
          } else {
            // Neptune/Uranus-like: white storms
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
          }
          ctx.fill()
          ctx.restore()
        }
      }

      // Set pixel color
      const i = (y * resolution + x) * 4
      data[i] = pixelColor.r * 255
      data[i + 1] = pixelColor.g * 255
      data[i + 2] = pixelColor.b * 255
      data[i + 3] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)

  // Add large swirling patterns
  for (let i = 0; i < 5; i++) {
    const centerX = Math.random() * resolution
    const centerY = Math.random() * resolution
    const radius = Math.random() * (resolution / 3) + resolution / 10

    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)

    // Color based on planet type
    if (isJupiterLike) {
      // Jupiter-like
      gradient.addColorStop(0, "rgba(255, 200, 100, 0.4)")
      gradient.addColorStop(0.7, "rgba(180, 100, 40, 0.15)")
    } else {
      // Neptune/Uranus-like
      gradient.addColorStop(0, "rgba(220, 255, 255, 0.4)")
      gradient.addColorStop(0.7, "rgba(50, 120, 220, 0.15)")
    }
    gradient.addColorStop(1, "transparent")

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.ellipse(centerX, centerY, radius, radius * 0.6, Math.random() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }

  // Add highlights for more vibrant appearance
  const highlight = ctx.createRadialGradient(
    resolution * 0.3,
    resolution * 0.3,
    0,
    resolution * 0.3,
    resolution * 0.3,
    resolution * 0.6,
  )

  highlight.addColorStop(0, "rgba(255, 255, 255, 0.15)")
  highlight.addColorStop(0.5, "rgba(255, 255, 255, 0.05)")
  highlight.addColorStop(1, "rgba(255, 255, 255, 0)")

  ctx.fillStyle = highlight
  ctx.fillRect(0, 0, resolution, resolution)
}

// Enhance the createSunTexture function for more realistic sun
function createSunTexture(ctx: CanvasRenderingContext2D, resolution: number, baseColor: string, detail: number) {
  // Create a dynamic, plasma-like surface
  const imageData = ctx.getImageData(0, 0, resolution, resolution)
  const data = imageData.data

  // Create base gradient
  const gradient = ctx.createRadialGradient(
    resolution / 2,
    resolution / 2,
    0,
    resolution / 2,
    resolution / 2,
    resolution / 2,
  )

  gradient.addColorStop(0, "#fffdf8")
  gradient.addColorStop(0.2, "#fff5e0")
  gradient.addColorStop(0.5, baseColor)
  gradient.addColorStop(0.8, "#ff7700")
  gradient.addColorStop(0.95, "#ff4400")
  gradient.addColorStop(1, "#ff2200")

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, resolution, resolution)

  // Create a noisy plasma-like texture
  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      // Calculate distance from center (for circular pattern)
      const nx = x / resolution - 0.5
      const ny = y / resolution - 0.5
      const r = Math.sqrt(nx * nx + ny * ny) * 2

      // Skip pixels outside the circle
      if (r > 1) continue

      // Convert to spherical coordinates for the texture
      const theta = Math.atan2(ny, nx)
      const phi = Math.acos(r)

      const xPos = Math.sin(phi) * Math.cos(theta)
      const yPos = Math.sin(phi) * Math.sin(theta)
      const zPos = Math.cos(phi)

      // Multiple noise layers at different frequencies
      const time = Date.now() * 0.0001 // Animatable if needed
      const noise1 = fractalNoise(xPos * detail + time, yPos * detail, zPos * detail, 4, 0.5)
      const noise2 = fractalNoise(xPos * detail * 2, yPos * detail * 2 + time, zPos * detail * 3, 2, 0.7)
      const noise3 = fractalNoise(xPos * detail * 4, yPos * detail * 4, zPos * detail * 5, 2, 0.8)

      // Combine for turbulent plasma effect
      const plasma = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2

      // Get current pixel color
      const i = (y * resolution + x) * 4
      const currR = data[i] / 255
      const currG = data[i + 1] / 255
      const currB = data[i + 2] / 255

      // Create color variation based on noise
      const newColor = new Color(currR, currG, currB)

      // Adjust color - brighter areas for solar flares
      if (plasma > 0.7) {
        newColor.offsetHSL(0, -0.3, 0.3) // Whiter/brighter
      } else if (plasma < 0.3) {
        newColor.offsetHSL(0.05, 0.3, -0.1) // Darker/more orange
      }

      // Set pixel color
      data[i] = newColor.r * 255
      data[i + 1] = newColor.g * 255
      data[i + 2] = newColor.b * 255
      data[i + 3] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)

  // Add solar flares/prominences
  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2
    const distance = resolution * 0.35 + Math.random() * resolution * 0.15
    const x = resolution / 2 + Math.cos(angle) * distance
    const y = resolution / 2 + Math.sin(angle) * distance

    // Create flare gradient
    const flareGradient = ctx.createRadialGradient(x, y, 0, x, y, resolution * 0.2)

    flareGradient.addColorStop(0, "rgba(255, 250, 220, 0.9)")
    flareGradient.addColorStop(0.3, "rgba(255, 200, 100, 0.7)")
    flareGradient.addColorStop(0.6, "rgba(255, 140, 60, 0.5)")
    flareGradient.addColorStop(1, "transparent")

    ctx.fillStyle = flareGradient
    ctx.beginPath()

    // Random shape for flare
    if (Math.random() > 0.5) {
      // Arc flare
      const sweepAngle = (Math.random() * Math.PI) / 2 + Math.PI / 4
      const startAngle = Math.random() * Math.PI * 2
      ctx.arc(x, y, resolution * 0.15, startAngle, startAngle + sweepAngle)
    } else {
      // Elliptical flare
      ctx.ellipse(
        x,
        y,
        resolution * 0.1 + Math.random() * resolution * 0.08,
        resolution * 0.05 + Math.random() * resolution * 0.04,
        Math.random() * Math.PI * 2,
        0,
        Math.PI * 2,
      )
    }

    ctx.fill()
  }

  // Add corona effect around the edge
  const coronaGradient = ctx.createRadialGradient(
    resolution / 2,
    resolution / 2,
    resolution * 0.45,
    resolution / 2,
    resolution / 2,
    resolution * 0.75,
  )

  coronaGradient.addColorStop(0, "rgba(255, 220, 120, 0.4)")
  coronaGradient.addColorStop(0.3, "rgba(255, 180, 80, 0.25)")
  coronaGradient.addColorStop(0.6, "rgba(255, 150, 50, 0.15)")
  coronaGradient.addColorStop(1, "transparent")

  ctx.fillStyle = coronaGradient
  ctx.beginPath()
  ctx.arc(resolution / 2, resolution / 2, resolution * 0.75, 0, Math.PI * 2)
  ctx.fill()
}

// Enhance the createRingsTexture function for more realistic Saturn rings
function createRingsTexture(ctx: CanvasRenderingContext2D, resolution: number, baseColor: string, detail: number) {
  // Start with a transparent background
  ctx.clearRect(0, 0, resolution, resolution)

  // Create more realistic rings with gaps
  const centerX = resolution / 2
  const centerY = resolution / 2
  const baseColorObj = new Color(baseColor)

  // Define major ring divisions (like Cassini Division)
  const ringGaps = [0.7, 0.77, 0.82, 0.905]

  // Create base rings first
  const outerRadius = resolution * 0.47
  const innerRadius = resolution * 0.3

  // Draw multiple concentric rings with varying properties
  for (let r = innerRadius; r <= outerRadius; r += 0.5) {
    // Smaller step for more detail
    const normalizedRadius = (r - innerRadius) / (outerRadius - innerRadius)

    // Check if this radius falls in a gap
    const inGap = ringGaps.some((gap) => Math.abs(normalizedRadius - gap) < 0.01)

    if (inGap) continue

    // Vary opacity and color based on position
    const ringOpacity = 0.8 + Math.sin(normalizedRadius * Math.PI * 15) * 0.15
    let ringColor

    // Color variation
    if (normalizedRadius < 0.3) {
      // Inner rings - darker
      ringColor = baseColorObj.clone().multiplyScalar(0.7)
    } else if (normalizedRadius > 0.8) {
      // Outer rings - lighter
      ringColor = baseColorObj.clone().multiplyScalar(1.3)
    } else {
      // Middle rings - base color with noise
      ringColor = baseColorObj.clone()
      // Add color noise based on angle
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 360) {
        // More detail
        const x = centerX + Math.cos(angle) * r
        const y = centerY + Math.sin(angle) * r

        // Skip if outside canvas
        if (x < 0 || x >= resolution || y < 0 || y >= resolution) continue

        // Add noise to color
        const noise = fractalNoise(
          Math.cos(angle) * detail,
          Math.sin(angle) * detail,
          normalizedRadius * detail,
          3,
          0.5,
        )

        const pixelColor = ringColor.clone()
        pixelColor.offsetHSL(0, 0, (noise - 0.5) * 0.25)

        // Draw pixel-perfect ring
        ctx.fillStyle = `rgba(${pixelColor.r * 255}, ${pixelColor.g * 255}, ${pixelColor.b * 255}, ${ringOpacity})`
        ctx.fillRect(x, y, 1, 1)
      }
      continue // Skip the arc drawing for middle rings where we've drawn pixel by pixel
    }

    // Draw ring
    ctx.strokeStyle = `rgba(${ringColor.r * 255}, ${ringColor.g * 255}, ${ringColor.b * 255}, ${ringOpacity})`
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(centerX, centerY, r, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Add some particle concentrations in the rings
  for (let i = 0; i < 120; i++) {
    // More particles
    const angle = Math.random() * Math.PI * 2
    const r = innerRadius + Math.random() * (outerRadius - innerRadius)
    const normalizedRadius = (r - innerRadius) / (outerRadius - innerRadius)

    // Skip if in a gap
    const inGap = ringGaps.some((gap) => Math.abs(normalizedRadius - gap) < 0.015)
    if (inGap) continue

    const size = Math.random() * 3 + 1
    const x = centerX + Math.cos(angle) * r
    const y = centerY + Math.sin(angle) * r

    // Vary particle colors
    const particleColor = baseColorObj.clone()
    particleColor.offsetHSL(0, 0, Math.random() * 0.5 - 0.2)

    ctx.fillStyle = `rgba(${particleColor.r * 255}, ${particleColor.g * 255}, ${particleColor.b * 255}, 0.95)`
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }

  // Add a subtle glow to the rings
  const ringGlow = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius)

  ringGlow.addColorStop(0, "rgba(255, 240, 220, 0.1)")
  ringGlow.addColorStop(0.5, "rgba(255, 220, 180, 0.05)")
  ringGlow.addColorStop(1, "transparent")

  ctx.fillStyle = ringGlow
  ctx.beginPath()
  ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2)
  ctx.fill()
}

// Enhance the createEarthTexture function for more realistic Earth
function createEarthTexture(
  ctx: CanvasRenderingContext2D,
  resolution: number,
  baseColor: string,
  noiseIntensity: number,
  detail: number,
) {
  const oceanColor = new Color("#1a4da8") // Deeper blue for oceans
  const landColor = new Color("#2d8a4f") // Richer green for land
  const snowColor = new Color("#ffffff") // White for snow/ice caps
  const cloudColor = new Color("#f8f8f8") // White/grey for clouds
  const desertColor = new Color("#d9c27e") // Sandy color for deserts

  // Start with all ocean
  ctx.fillStyle = oceanColor.getStyle()
  ctx.fillRect(0, 0, resolution, resolution)

  const imageData = ctx.getImageData(0, 0, resolution, resolution)
  const data = imageData.data

  // Create terrain with continents
  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      // Convert to spherical coordinates
      const u = x / resolution
      const v = y / resolution
      const theta = u * Math.PI * 2
      const phi = v * Math.PI

      // Convert to 3D coordinates on sphere
      const xPos = Math.sin(phi) * Math.cos(theta)
      const yPos = Math.sin(phi) * Math.sin(theta)
      const zPos = Math.cos(phi)

      // Create continent noise with multiple octaves
      const continentNoise = fractalNoise(xPos * 2, yPos * 2, zPos * 2, 8, 0.65)

      // Additional noise for terrain detail
      const detailNoise = fractalNoise(xPos * detail * 3, yPos * detail * 3, zPos * detail * 3, 4, 0.5)

      // Climate zone noise (for deserts, forests, etc.)
      const climateNoise = fractalNoise(xPos * 3 + 100, yPos * 3 + 100, zPos * 3 + 100, 3, 0.7)

      // Combined terrain height
      let terrainHeight = continentNoise * 0.7 + detailNoise * 0.3

      // Make more ocean than land
      terrainHeight = terrainHeight - 0.2

      // Create ice caps at poles
      const polarRegion = Math.abs(zPos) > 0.8

      // Determine pixel color based on height and position
      let pixelColor

      if (polarRegion) {
        // Snow at poles
        pixelColor = snowColor.clone()
        // Blend with terrain for a more natural look
        pixelColor.lerp(landColor, Math.max(0, 0.7 - Math.abs(zPos)))
      } else if (terrainHeight > 0) {
        // Land areas

        // Determine land type based on latitude and climate noise
        const latitude = Math.abs(zPos)

        if (latitude < 0.3 && climateNoise > 0.5) {
          // Desert regions near equator
          pixelColor = desertColor.clone()
        } else if (latitude > 0.5 && latitude < 0.7) {
          // Temperate regions - darker green
          pixelColor = landColor.clone().offsetHSL(0.05, 0.2, -0.1)
        } else {
          // Default land
          pixelColor = landColor.clone()
        }

        // Higher terrain gets lighter (mountains)
        if (terrainHeight > 0.3) {
          const snowAmount = (terrainHeight - 0.3) * 3
          pixelColor.lerp(snowColor, Math.min(snowAmount, 0.8))
        }

        // Add variations to land based on detail noise
        if (detailNoise < 0.4) {
          pixelColor.offsetHSL(0.05, 0.3, -0.1) // More desert-like
        }
      } else {
        // Ocean areas
        pixelColor = oceanColor.clone()

        // Depth variations in ocean
        const depth = Math.abs(terrainHeight) * 2
        pixelColor.offsetHSL(0, 0.1, depth * 0.15 - 0.15) // Darker for deeper water

        // Add shallow water near coasts
        if (terrainHeight > -0.1) {
          pixelColor.lerp(new Color("#4ac7e7"), 0.3) // Turquoise for shallow water
        }
      }

      // Add cloud layer
      const cloudNoise = fractalNoise(xPos * 5 + 100, yPos * 5 + 100, zPos * 5 + 100, 4, 0.6)
      if (cloudNoise > 0.65) {
        // Only clouds above a certain threshold
        const cloudAmount = (cloudNoise - 0.65) * 3
        pixelColor.lerp(cloudColor, Math.min(cloudAmount, 0.7))
      }

      // Set pixel color
      const i = (y * resolution + x) * 4
      data[i] = pixelColor.r * 255
      data[i + 1] = pixelColor.g * 255
      data[i + 2] = pixelColor.b * 255
      data[i + 3] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)

  // Add specular highlights for oceans
  const oceanHighlight = ctx.createRadialGradient(
    resolution * 0.6,
    resolution * 0.4,
    0,
    resolution * 0.6,
    resolution * 0.4,
    resolution * 0.2,
  )

  oceanHighlight.addColorStop(0, "rgba(255, 255, 255, 0.2)")
  oceanHighlight.addColorStop(0.5, "rgba(255, 255, 255, 0.1)")
  oceanHighlight.addColorStop(1, "rgba(255, 255, 255, 0)")

  ctx.fillStyle = oceanHighlight
  ctx.fillRect(0, 0, resolution, resolution)
}

function createMarsTexture(
  ctx: CanvasRenderingContext2D,
  resolution: number,
  baseColor: string,
  noiseIntensity: number,
  detail: number,
) {
  const marsRedColor = new Color("#c1440e") // Base rust/red color
  const darkColor = new Color("#6b2308") // Darker areas
  const dustColor = new Color("#e07a26") // Dust and highlands
  const polarColor = new Color("#f0f0f0") // White for polar caps

  // Fill with base red color
  ctx.fillStyle = marsRedColor.getStyle()
  ctx.fillRect(0, 0, resolution, resolution)

  const imageData = ctx.getImageData(0, 0, resolution, resolution)
  const data = imageData.data

  // Create Mars surface
  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      // Convert to spherical coordinates
      const u = x / resolution
      const v = y / resolution
      const theta = u * Math.PI * 2
      const phi = v * Math.PI

      // Convert to 3D coordinates on sphere
      const xPos = Math.sin(phi) * Math.cos(theta)
      const yPos = Math.sin(phi) * Math.sin(theta)
      const zPos = Math.cos(phi)

      // Multiple noise layers for different features
      const baseNoise = fractalNoise(xPos * detail, yPos * detail, zPos * detail, 8, 0.55)
      const craterNoise = fractalNoise(xPos * detail * 3, yPos * detail * 3, zPos * detail * 3, 4, 0.8)
      const dustNoise = fractalNoise(xPos * detail * 2, yPos * detail * 2, zPos * detail * 2, 6, 0.4)

      // Combine noises for terrain
      const terrainValue = baseNoise * 0.5 + craterNoise * 0.3 + dustNoise * 0.2

      // Determine pixel color based on noise and position
      let pixelColor

      // Polar caps
      const isPolarCap = Math.abs(zPos) > 0.85

      if (isPolarCap) {
        // White polar cap with some terrain variation
        pixelColor = polarColor.clone()
        // Mix in some dust at edges
        if (Math.abs(zPos) < 0.9) {
          pixelColor.lerp(dustColor, (0.9 - Math.abs(zPos)) * 10)
        }
      } else {
        // Base terrain
        if (craterNoise > 0.7) {
          // Crater rims (lighter)
          pixelColor = dustColor.clone()
          pixelColor.offsetHSL(0, -0.1, 0.1)
        } else if (craterNoise < 0.3) {
          // Crater floors (darker)
          pixelColor = darkColor.clone()
        } else if (baseNoise > 0.6) {
          // Highlands and mountains
          pixelColor = dustColor.clone()
          pixelColor.offsetHSL(0, 0.1, 0.1)
        } else {
          // Regular terrain
          pixelColor = marsRedColor.clone()
          // Add some variation based on dust
          pixelColor.lerp(dustColor, dustNoise * 0.5)
        }

        // Add global variation based on latitude
        const latitudeEffect = Math.abs(zPos) * 0.3 // Slight effect based on latitude
        pixelColor.offsetHSL(0, 0, latitudeEffect) // Lighter at higher latitudes
      }

      // Set pixel color
      const i = (y * resolution + x) * 4
      data[i] = pixelColor.r * 255
      data[i + 1] = pixelColor.g * 255
      data[i + 2] = pixelColor.b * 255
      data[i + 3] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)

  // Add major surface features
  // Olympus Mons (largest volcano)
  const olympusX = resolution * 0.3
  const olympusY = resolution * 0.4
  const olympusSize = resolution * 0.12

  const volcanoGradient = ctx.createRadialGradient(olympusX, olympusY, 0, olympusX, olympusY, olympusSize)

  volcanoGradient.addColorStop(0, "rgba(230, 180, 100, 0.7)")
  volcanoGradient.addColorStop(0.3, "rgba(210, 140, 60, 0.5)")
  volcanoGradient.addColorStop(0.7, "rgba(180, 90, 40, 0.3)")
  volcanoGradient.addColorStop(1, "transparent")

  ctx.fillStyle = volcanoGradient
  ctx.beginPath()
  ctx.arc(olympusX, olympusY, olympusSize, 0, Math.PI * 2)
  ctx.fill()

  // Valles Marineris (canyon system)
  const vallesX = resolution * 0.6
  const vallesY = resolution * 0.5
  const vallesWidth = resolution * 0.3
  const vallesHeight = resolution * 0.05

  ctx.fillStyle = "rgba(100, 30, 10, 0.6)"
  ctx.beginPath()
  ctx.ellipse(vallesX, vallesY, vallesWidth, vallesHeight, Math.PI * 0.2, 0, Math.PI * 2)
  ctx.fill()
}

function createVenusTexture(
  ctx: CanvasRenderingContext2D,
  resolution: number,
  baseColor: string,
  noiseIntensity: number,
  detail: number,
) {
  const venusColor = new Color("#e0c48f") // Yellowish base color
  const darkAreaColor = new Color("#a89466") // Darker lowlands
  const brightAreaColor = new Color("#f0d8a0") // Lighter highlands

  // Fill with base color
  ctx.fillStyle = venusColor.getStyle()
  ctx.fillRect(0, 0, resolution, resolution)

  const imageData = ctx.getImageData(0, 0, resolution, resolution)
  const data = imageData.data

  // Create Venus thick cloud patterns
  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      // Convert to spherical coordinates
      const u = x / resolution
      const v = y / resolution
      const theta = u * Math.PI * 2
      const phi = v * Math.PI

      // Convert to 3D coordinates on sphere
      const xPos = Math.sin(phi) * Math.cos(theta)
      const yPos = Math.sin(phi) * Math.sin(theta)
      const zPos = Math.cos(phi)

      // Create cloud patterns with several noise layers
      const baseNoise = fractalNoise(xPos * detail, yPos * detail, zPos * detail, 6, 0.6)
      const swirls = fractalNoise(xPos * detail * 0.5, yPos * detail * 0.5, zPos * detail * 0.5, 3, 0.7)
      const details = fractalNoise(xPos * detail * 4, yPos * detail * 4, zPos * detail * 4, 2, 0.5)

      // Combine noise for cloud patterns
      // Venus has thick clouds with specific swirl patterns
      const cloudPattern = baseNoise * 0.5 + swirls * 0.3 + details * 0.2

      // Determine pixel color
      const pixelColor = venusColor.clone()

      // High-elevation terrain
      if (cloudPattern > 0.6) {
        pixelColor.lerp(brightAreaColor, (cloudPattern - 0.6) * 2)
      }
      // Low-elevation terrain
      else if (cloudPattern < 0.4) {
        pixelColor.lerp(darkAreaColor, (0.4 - cloudPattern) * 2)
      }

      // Create horizontal banding effect for cloud layers
      const bandEffect = Math.sin(phi * 8) * 0.05
      pixelColor.offsetHSL(0, 0, bandEffect)

      // Set pixel color
      const i = (y * resolution + x) * 4
      data[i] = pixelColor.r * 255
      data[i + 1] = pixelColor.g * 255
      data[i + 2] = pixelColor.b * 255
      data[i + 3] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)

  // Add sulfuric acid cloud swirls
  for (let i = 0; i < 6; i++) {
    const swX = Math.random() * resolution
    const swY = Math.random() * resolution
    const swSize = Math.random() * resolution * 0.2 + resolution * 0.1

    const swirlGradient = ctx.createRadialGradient(swX, swY, 0, swX, swY, swSize)

    swirlGradient.addColorStop(0, "rgba(240, 230, 180, 0.15)")
    swirlGradient.addColorStop(0.5, "rgba(220, 200, 140, 0.1)")
    swirlGradient.addColorStop(1, "transparent")

    ctx.fillStyle = swirlGradient

    // Draw elongated ellipse for swirl
    ctx.beginPath()
    ctx.ellipse(swX, swY, swSize, swSize * 0.4, Math.random() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }
}

function createMercuryTexture(
  ctx: CanvasRenderingContext2D,
  resolution: number,
  baseColor: string,
  noiseIntensity: number,
  detail: number,
) {
  const mercuryColor = new Color("#a59784") // Gray-brown base
  const darkColor = new Color("#6e6259") // Darker areas
  const lightColor = new Color("#cfc0b3") // Lighter areas
  const craterRimColor = new Color("#d7c9b8") // Bright crater rims

  // Fill with base color
  ctx.fillStyle = mercuryColor.getStyle()
  ctx.fillRect(0, 0, resolution, resolution)

  const imageData = ctx.getImageData(0, 0, resolution, resolution)
  const data = imageData.data

  // Create heavily cratered Mercury surface
  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      // Convert to spherical coordinates
      const u = x / resolution
      const v = y / resolution
      const theta = u * Math.PI * 2
      const phi = v * Math.PI

      // Convert to 3D coordinates on sphere
      const xPos = Math.sin(phi) * Math.cos(theta)
      const yPos = Math.sin(phi) * Math.sin(theta)
      const zPos = Math.cos(phi)

      // Multi-scale noise for different crater sizes and terrain
      const largeFeatures = fractalNoise(xPos * detail * 0.5, yPos * detail * 0.5, zPos * detail * 0.5, 4, 0.5)
      const mediumCraters = fractalNoise(xPos * detail * 2, yPos * detail * 2, zPos * detail * 2, 5, 0.6)
      const smallCraters = fractalNoise(xPos * detail * 6, yPos * detail * 6, zPos * detail * 6, 3, 0.7)

      // Determine terrain type
      const combinedTerrain = largeFeatures * 0.4 + mediumCraters * 0.4 + smallCraters * 0.2

      // Determine pixel color
      let pixelColor

      // Lots of crater features
      if (mediumCraters > 0.7 && smallCraters > 0.6) {
        // Crater rims
        pixelColor = craterRimColor.clone()
      } else if (mediumCraters < 0.3 && smallCraters < 0.4) {
        // Crater floors
        pixelColor = darkColor.clone()
      } else if (largeFeatures > 0.6) {
        // Highlands
        pixelColor = lightColor.clone()
      } else {
        // General terrain
        pixelColor = mercuryColor.clone()
        // Add some variation
        pixelColor.offsetHSL(0, 0, (combinedTerrain - 0.5) * 0.2)
      }

      // Set pixel color
      const i = (y * resolution + x) * 4
      data[i] = pixelColor.r * 255
      data[i + 1] = pixelColor.g * 255
      data[i + 2] = pixelColor.b * 255
      data[i + 3] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)

  // Add major impact craters
  for (let i = 0; i < 25; i++) {
    const craterX = Math.random() * resolution
    const craterY = Math.random() * resolution
    const craterSize = Math.random() * resolution * 0.1 + resolution * 0.02

    // Crater floor
    ctx.fillStyle = darkColor.getStyle()
    ctx.beginPath()
    ctx.arc(craterX, craterY, craterSize, 0, Math.PI * 2)
    ctx.fill()

    // Crater rim
    ctx.strokeStyle = craterRimColor.getStyle()
    ctx.lineWidth = craterSize * 0.15
    ctx.beginPath()
    ctx.arc(craterX, craterY, craterSize * 0.9, 0, Math.PI * 2)
    ctx.stroke()

    // Ejecta rays for some larger craters
    if (craterSize > resolution * 0.06) {
      const rayCount = Math.floor(Math.random() * 8) + 6
      const rayLength = craterSize * (Math.random() * 6 + 4)

      for (let ray = 0; ray < rayCount; ray++) {
        const angle = ray * ((Math.PI * 2) / rayCount) + Math.random() * 0.5
        const rayX = craterX + Math.cos(angle) * (craterSize + rayLength * 0.5)
        const rayY = craterY + Math.sin(angle) * (craterSize + rayLength * 0.5)

        // Create ray gradient
        const rayGradient = ctx.createLinearGradient(craterX, craterY, rayX, rayY)

        rayGradient.addColorStop(0, "rgba(215, 201, 184, 0.7)")
        rayGradient.addColorStop(0.5, "rgba(215, 201, 184, 0.3)")
        rayGradient.addColorStop(1, "transparent")

        ctx.fillStyle = rayGradient
        ctx.beginPath()

        // Draw tapered ray
        const rayWidth = craterSize * 0.4

        ctx.moveTo(craterX, craterY)
        ctx.lineTo(craterX + Math.cos(angle - 0.2) * craterSize, craterY + Math.sin(angle - 0.2) * craterSize)
        ctx.lineTo(rayX + Math.cos(angle + 0.1) * rayWidth, rayY + Math.sin(angle + 0.1) * rayWidth)
        ctx.lineTo(rayX + Math.cos(angle - 0.1) * rayWidth, rayY + Math.sin(angle - 0.1) * rayWidth)
        ctx.lineTo(craterX + Math.cos(angle + 0.2) * craterSize, craterY + Math.sin(angle + 0.2) * craterSize)
        ctx.closePath()
        ctx.fill()
      }
    }
  }
}

export { createProceduralPlanetTexture }

