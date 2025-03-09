/**
 * This file contains functions for calculating astronomical positions of planets
 * based on simplified orbital elements and time.
 *
 * The calculations are simplified versions of Keplerian orbital mechanics.
 */

// Orbital elements for planets (simplified)
// Values are:
// - semimajorAxis: in AU (Astronomical Units)
// - eccentricity: orbital eccentricity
// - inclination: in degrees
// - longitudeOfAscendingNode: in degrees
// - argumentOfPerihelion: in degrees
// - meanAnomalyAtEpoch: in degrees (at J2000)
// - orbitalPeriod: in Earth years
export const planetOrbitalElements = {
  mercury: {
    semimajorAxis: 0.387,
    eccentricity: 0.206,
    inclination: 7.0,
    longitudeOfAscendingNode: 48.3,
    argumentOfPerihelion: 29.1,
    meanAnomalyAtEpoch: 174.8,
    orbitalPeriod: 0.241,
  },
  venus: {
    semimajorAxis: 0.723,
    eccentricity: 0.007,
    inclination: 3.4,
    longitudeOfAscendingNode: 76.7,
    argumentOfPerihelion: 54.9,
    meanAnomalyAtEpoch: 50.4,
    orbitalPeriod: 0.615,
  },
  earth: {
    semimajorAxis: 1.0,
    eccentricity: 0.017,
    inclination: 0.0,
    longitudeOfAscendingNode: 174.9,
    argumentOfPerihelion: 288.1,
    meanAnomalyAtEpoch: 357.5,
    orbitalPeriod: 1.0,
  },
  mars: {
    semimajorAxis: 1.524,
    eccentricity: 0.093,
    inclination: 1.8,
    longitudeOfAscendingNode: 49.6,
    argumentOfPerihelion: 286.5,
    meanAnomalyAtEpoch: 19.4,
    orbitalPeriod: 1.881,
  },
  jupiter: {
    semimajorAxis: 5.203,
    eccentricity: 0.048,
    inclination: 1.3,
    longitudeOfAscendingNode: 100.5,
    argumentOfPerihelion: 273.9,
    meanAnomalyAtEpoch: 20.0,
    orbitalPeriod: 11.86,
  },
  saturn: {
    semimajorAxis: 9.537,
    eccentricity: 0.056,
    inclination: 2.5,
    longitudeOfAscendingNode: 113.7,
    argumentOfPerihelion: 339.4,
    meanAnomalyAtEpoch: 317.0,
    orbitalPeriod: 29.46,
  },
  uranus: {
    semimajorAxis: 19.191,
    eccentricity: 0.046,
    inclination: 0.8,
    longitudeOfAscendingNode: 74.0,
    argumentOfPerihelion: 96.7,
    meanAnomalyAtEpoch: 142.0,
    orbitalPeriod: 84.01,
  },
  neptune: {
    semimajorAxis: 30.069,
    eccentricity: 0.01,
    inclination: 1.8,
    longitudeOfAscendingNode: 131.8,
    argumentOfPerihelion: 273.2,
    meanAnomalyAtEpoch: 267.0,
    orbitalPeriod: 164.8,
  },
}

// J2000 epoch (January 1, 2000, 12:00 UTC)
const J2000 = new Date("2000-01-01T12:00:00Z")

// Convert degrees to radians
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

// Convert radians to degrees
function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI
}

// Calculate the number of days since J2000 epoch
function daysSinceJ2000(date: Date): number {
  return (date.getTime() - J2000.getTime()) / (1000 * 60 * 60 * 24)
}

// Calculate the mean anomaly at a given time
function calculateMeanAnomaly(meanAnomalyAtEpoch: number, orbitalPeriod: number, daysSinceEpoch: number): number {
  // Convert orbital period from years to days
  const orbitalPeriodInDays = orbitalPeriod * 365.25

  // Calculate mean motion in degrees per day
  const meanMotion = 360 / orbitalPeriodInDays

  // Calculate current mean anomaly
  let meanAnomaly = meanAnomalyAtEpoch + meanMotion * daysSinceEpoch

  // Normalize to 0-360 degrees
  meanAnomaly = meanAnomaly % 360
  if (meanAnomaly < 0) meanAnomaly += 360

  return meanAnomaly
}

// Solve Kepler's equation to find the eccentric anomaly
function solveKepler(meanAnomaly: number, eccentricity: number): number {
  // Convert mean anomaly to radians
  const M = toRadians(meanAnomaly)

  // Initial guess for eccentric anomaly
  let E = M

  // Newton-Raphson iteration to solve Kepler's equation
  const maxIterations = 10
  const tolerance = 1e-6

  for (let i = 0; i < maxIterations; i++) {
    const delta = E - eccentricity * Math.sin(E) - M
    if (Math.abs(delta) < tolerance) break
    E = E - delta / (1 - eccentricity * Math.cos(E))
  }

  return toDegrees(E)
}

// Calculate the true anomaly from eccentric anomaly
function calculateTrueAnomaly(eccentricAnomaly: number, eccentricity: number): number {
  const E = toRadians(eccentricAnomaly)

  // Calculate true anomaly
  const cosV = (Math.cos(E) - eccentricity) / (1 - eccentricity * Math.cos(E))
  const sinV = (Math.sqrt(1 - eccentricity * eccentricity) * Math.sin(E)) / (1 - eccentricity * Math.cos(E))

  let trueAnomaly = toDegrees(Math.atan2(sinV, cosV))
  if (trueAnomaly < 0) trueAnomaly += 360

  return trueAnomaly
}

// Calculate the heliocentric coordinates (in the orbital plane)
function calculateHeliocentricCoordinates(
  semimajorAxis: number,
  eccentricity: number,
  trueAnomaly: number,
): { x: number; y: number; z: number } {
  // Convert true anomaly to radians
  const v = toRadians(trueAnomaly)

  // Calculate distance from the Sun
  const r = (semimajorAxis * (1 - eccentricity * eccentricity)) / (1 + eccentricity * Math.cos(v))

  // Calculate coordinates in the orbital plane
  const x = r * Math.cos(v)
  const y = r * Math.sin(v)

  return { x, y, z: 0 }
}

// Rotate coordinates from orbital plane to ecliptic plane
function rotateToEcliptic(
  coords: { x: number; y: number; z: number },
  inclination: number,
  longitudeOfAscendingNode: number,
  argumentOfPerihelion: number,
): { x: number; y: number; z: number } {
  // Convert angles to radians
  const i = toRadians(inclination)
  const Omega = toRadians(longitudeOfAscendingNode)
  const omega = toRadians(argumentOfPerihelion)

  // Rotate coordinates
  const xEcliptic =
    coords.x * (Math.cos(omega) * Math.cos(Omega) - Math.sin(omega) * Math.sin(Omega) * Math.cos(i)) +
    coords.y * (-Math.sin(omega) * Math.cos(Omega) - Math.cos(omega) * Math.sin(Omega) * Math.cos(i))

  const yEcliptic =
    coords.x * (Math.cos(omega) * Math.sin(Omega) + Math.sin(omega) * Math.cos(Omega) * Math.cos(i)) +
    coords.y * (-Math.sin(omega) * Math.sin(Omega) + Math.cos(omega) * Math.cos(Omega) * Math.cos(i))

  const zEcliptic = coords.x * Math.sin(omega) * Math.sin(i) + coords.y * Math.cos(omega) * Math.sin(i)

  return { x: xEcliptic, y: yEcliptic, z: zEcliptic }
}

// Calculate planet position at a given date
export function calculatePlanetPosition(planetId: string, date: Date): { x: number; y: number; z: number } {
  // Get orbital elements for the planet
  const elements = planetOrbitalElements[planetId as keyof typeof planetOrbitalElements]
  if (!elements) {
    console.error(`No orbital elements found for planet: ${planetId}`)
    return { x: 0, y: 0, z: 0 }
  }

  // Calculate days since J2000
  const days = daysSinceJ2000(date)

  // Calculate mean anomaly
  const meanAnomaly = calculateMeanAnomaly(elements.meanAnomalyAtEpoch, elements.orbitalPeriod, days)

  // Solve Kepler's equation to find eccentric anomaly
  const eccentricAnomaly = solveKepler(meanAnomaly, elements.eccentricity)

  // Calculate true anomaly
  const trueAnomaly = calculateTrueAnomaly(eccentricAnomaly, elements.eccentricity)

  // Calculate heliocentric coordinates in the orbital plane
  const orbitalCoords = calculateHeliocentricCoordinates(elements.semimajorAxis, elements.eccentricity, trueAnomaly)

  // Rotate to ecliptic coordinates
  const eclipticCoords = rotateToEcliptic(
    orbitalCoords,
    elements.inclination,
    elements.longitudeOfAscendingNode,
    elements.argumentOfPerihelion,
  )

  return eclipticCoords
}

// Update the scaleCoordinatesToVisualization function to ensure planets don't overlap
export function scaleCoordinatesToVisualization(
  coords: { x: number; y: number; z: number },
  scaleFactor = 6, // Reduced from 8 to 6 for better spacing
): { x: number; y: number; z: number } {
  // Add minimum distances between planets to prevent overlap
  const minDistance = 6 // Minimum distance between planets
  const distance = Math.sqrt(coords.x * coords.x + coords.y * coords.y + coords.z * coords.z)

  // Apply logarithmic scaling to maintain relative distances while preventing overlap
  const scaledDistance = Math.log(distance * 5 + 1) * scaleFactor * 2

  // If distance is very small (like for Mercury), ensure minimum distance
  const finalDistance = Math.max(scaledDistance, minDistance)

  // Scale the coordinates proportionally
  const scale = distance > 0 ? finalDistance / distance : 1

  return {
    x: coords.x * scale,
    y: coords.z * scale, // Swap y and z for 3D visualization
    z: coords.y * scale,
  }
}

// Update the getAllPlanetPositions function to ensure better spacing
export function getAllPlanetPositions(
  date: Date,
  scaleFactor = 6, // Reduced from 8 to 6 for better spacing
): Record<string, { x: number; y: number; z: number }> {
  const positions: Record<string, { x: number; y: number; z: number }> = {}

  for (const planetId of Object.keys(planetOrbitalElements)) {
    const eclipticCoords = calculatePlanetPosition(planetId, date)
    positions[planetId] = scaleCoordinatesToVisualization(eclipticCoords, scaleFactor)
  }

  return positions
}

