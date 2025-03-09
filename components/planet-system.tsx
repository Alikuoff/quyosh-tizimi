"use client"

import { useRef, useEffect, useState } from "react"
import { useFrame } from "@react-three/fiber"
import type { Group } from "three"
import { usePlanetContext } from "@/context/planet-context"
import { useTimeContext } from "@/context/time-context"
import ProceduralPlanet from "./procedural-planet"
import BlackHole from "./black-hole"
import { getAllPlanetPositions } from "@/lib/astronomical-calculations"

// Update the planet data with more accurate orbital radii and better spacing
const planets = [
  {
    id: "sun",
    name: "Quyosh",
    radius: 5.5,
    position: [0, 0, 0],
    rotationSpeed: 0.001,
    orbitalSpeed: 0,
    orbitalRadius: 0,
    texture: "/placeholder.svg?height=512&width=512&text=Sun",
    emissive: true,
    description:
      "Quyosh tizimimizning markaziy yulduzi bo'lib, uning atrofida barcha sayyoralar aylanadi. Quyosh massasi Yer massasidan 330,000 marta katta va diametri 1,392,000 kilometrga teng. Uning yuzasidagi harorat 5,500°C, yadrosida esa 15 million°C ga yetadi. Quyosh yuzasida doimiy ravishda quyosh chaqnashlari va portlashlar sodir bo'lib turadi.",
  },
  {
    id: "mercury",
    name: "Merkuriy",
    radius: 0.8,
    position: [10, 0, 0], // Increased distance from Sun
    rotationSpeed: 0.004,
    orbitalSpeed: 0.008,
    orbitalRadius: 10, // Increased orbital radius
    texture: "/placeholder.svg?height=512&width=512&text=Mercury",
    description:
      "Merkuriy quyoshga eng yaqin va eng kichik sayyora hisoblanadi. Uning yuzasi kraterlar bilan qoplangan bo'lib, atmosferasi deyarli yo'q. Merkuriyda kunning harorati 430°C ga yetsa, kechasi -180°C gacha pasayadi. Uning yuzasi Oynikiga o'xshash bo'lib, ko'plab meteorit kraterlari bilan qoplangan.",
  },
  {
    id: "venus",
    name: "Venera",
    radius: 1.2,
    position: [16, 0, 0], // Increased distance from Sun and Mercury
    rotationSpeed: 0.002,
    orbitalSpeed: 0.006,
    orbitalRadius: 16, // Increased orbital radius
    texture: "/placeholder.svg?height=512&width=512&text=Venus",
    description:
      "Venera o'lcham va massa jihatidan Yerga o'xshash bo'lib, uning atmosferasi karbonat angidrid bilan to'lgan. Venera quyosh tizimidagi eng issiq sayyora bo'lib, uning yuzasidagi harorat 462°C ga yetadi. Atmosfera bosimi Yerdagidan 92 marta yuqori. Venera bulutlari sulfat kislotasidan tashkil topgan bo'lib, sayyora yuzasini to'liq qoplaydi.",
  },
  {
    id: "earth",
    name: "Yer",
    radius: 1.3,
    position: [22, 0, 0], // Increased distance from Venus
    rotationSpeed: 0.01,
    orbitalSpeed: 0.005,
    orbitalRadius: 22, // Increased orbital radius
    texture: "/placeholder.svg?height=512&width=512&text=Earth",
    description:
      "Yer bizning uyimiz, hayot mavjud bo'lgan yagona sayyora sifatida ma'lum. Yer yuzasining 71% suv bilan qoplangan. Uning atmosferasi 78% azot va 21% kisloroddan iborat. Yerning bitta tabiiy yo'ldoshi - Oy mavjud. Yer o'z o'qi atrofida 24 soatda bir marta aylanadi va Quyosh atrofida 365.25 kunda bir marta to'liq aylanib chiqadi.",
    satellites: [
      {
        id: "moon",
        name: "Oy",
        radius: 0.35,
        rotationSpeed: 0.001,
        orbitalSpeed: 0.015,
        orbitalRadius: 3,
        texture: "/placeholder.svg?height=512&width=512&text=Moon",
        description:
          "Oy - Yerning yagona tabiiy yo'ldoshi bo'lib, Yerdan 384,400 km masofada joylashgan. Oy Yer atrofida 27.3 kunda bir marta aylanadi va o'z o'qi atrofida ham xuddi shu vaqtda aylanadi, shuning uchun biz doimo Oyning bir tomonini ko'ramiz. Oy yuzasi kraterlar, tog'lar va tekisliklar bilan qoplangan. Oy gravitatsiyasi Yer okeanlarida qalqish va qaytish hodisalarini keltirib chiqaradi.",
      },
    ],
  },
  {
    id: "mars",
    name: "Mars",
    radius: 1.1,
    position: [28, 0, 0], // Increased distance from Earth
    rotationSpeed: 0.008,
    orbitalSpeed: 0.004,
    orbitalRadius: 28, // Increased orbital radius
    texture: "/placeholder.svg?height=512&width=512&text=Mars",
    description:
      "Mars 'qizil sayyora' deb ataladi va uning yuzasida suv mavjudligi aniqlangan. Mars yuzasi temir oksidi (zang) tufayli qizil rangga ega. Marsda qutblarda muz qalpoqlari mavjud va Quyosh tizimidagi eng baland tog' - Olimp vulqoni (21 km) joylashgan. Mars atmosferasi juda siyrak bo'lib, asosan karbonat angidriddan iborat.",
  },
  {
    id: "jupiter",
    name: "Yupiter",
    radius: 3.5,
    position: [38, 0, 0], // Increased distance from Mars
    rotationSpeed: 0.02,
    orbitalSpeed: 0.002,
    orbitalRadius: 38, // Increased orbital radius
    texture: "/placeholder.svg?height=512&width=512&text=Jupiter",
    description:
      "Yupiter quyosh tizimidagi eng katta sayyora bo'lib, gaz giganti hisoblanadi. Uning massasi barcha boshqa sayyoralar massasining yig'indisidan 2.5 marta katta. Yupiterning Katta Qizil Dog'i 300 yildan beri kuzatilayotgan ulkan bo'ron bo'lib, o'lchami Yerdan kattaroq. Yupiterning 79 ta ma'lum yo'ldoshi bor, ularning eng kattasi Ganimede Merkuriydan ham katta.",
  },
  {
    id: "saturn",
    name: "Saturn",
    radius: 3.0,
    position: [50, 0, 0], // Increased distance from Jupiter
    rotationSpeed: 0.018,
    orbitalSpeed: 0.0015,
    orbitalRadius: 50, // Increased orbital radius
    texture: "/placeholder.svg?height=512&width=512&text=Saturn",
    hasRings: true,
    description:
      "Saturn o'zining ajoyib halqalari bilan mashhur bo'lgan gaz giganti sayyoradir. Halqalar asosan muz va chang zarrachalaridan iborat. Saturn zichligi suvnikidan kam bo'lgani uchun, agar yetarlicha katta suv havzasi bo'lsa, u suvda suzishi mumkin. Saturnning 82 ta ma'lum yo'ldoshi bor, ularning eng kattasi Titan atmosferaga ega bo'lgan yagona yo'ldosh hisoblanadi.",
  },
  {
    id: "uranus",
    name: "Uran",
    radius: 2.2,
    position: [62, 0, 0], // Increased distance from Saturn
    rotationSpeed: 0.012,
    orbitalSpeed: 0.001,
    orbitalRadius: 62, // Increased orbital radius
    texture: "/placeholder.svg?height=512&width=512&text=Uranus",
    description:
      "Uran quyosh tizimidagi yettinchi sayyora bo'lib, muzli gaz giganti hisoblanadi. U o'z o'qi atrofida yonbosh holatda aylanadi (o'qi orbitasiga deyarli parallel). Uranning 27 ta ma'lum yo'ldoshi bor va uning atmosferasi asosan vodorod, geliy va metandan iborat. Uran ko'kimtir rangga ega bo'lib, bu uning atmosferasidagi metan gazining quyosh nurlarini yutishi natijasida hosil bo'ladi.",
  },
  {
    id: "neptune",
    name: "Neptun",
    radius: 2.1,
    position: [74, 0, 0], // Increased distance from Uranus
    rotationSpeed: 0.014,
    orbitalSpeed: 0.0008,
    orbitalRadius: 74, // Increased orbital radius
    texture: "/placeholder.svg?height=512&width=512&text=Neptune",
    description:
      "Neptun quyosh tizimidagi eng uzoq sayyora bo'lib, kuchli shamollar bilan mashhur. Unda Quyosh tizimidagi eng kuchli shamollar kuzatilgan - tezligi soatiga 2100 km ga yetadi. Neptun ko'k rangga ega bo'lib, bu uning atmosferasidagi metan gazining quyosh nurlarini yutishi natijasida hosil bo'ladi. Neptunning 14 ta ma'lum yo'ldoshi bor, ularning eng kattasi Triton teskari yo'nalishda aylanadi.",
  },
  {
    id: "blackhole",
    name: "Qora tuynuk",
    radius: 4.0,
    position: [90, 0, 0], // Increased distance from Neptune
    rotationSpeed: 0.002,
    orbitalSpeed: 0.0004,
    orbitalRadius: 90, // Increased orbital radius
    isBlackHole: true,
    description:
      "Qora tuynuk - gravitatsion tortishishi shunchalik kuchliki, yorug'lik ham undan qochib chiqolmaydigan fazoviy-vaqt sohasiga ega obyekt. Qora tuynuklar massiv yulduzlar o'z umrini tugallab, o'z og'irligi ostida qulashi natijasida yuzaga keladi. Ushbu Qora tuynuk atrofida akkresiya diski mavjud bo'lib, u yulduz moddasini o'ziga tortishi natijasida hosil bo'ladi. Gravitatsion linzalash ta'siri uning yorug'likni qanday bukib yuborishini ko'rsatadi.",
  },
]

// Create a map of planet data by ID for easy access
const planetDataMap = planets.reduce(
  (map, planet) => {
    map[planet.id] = planet
    return map
  },
  {} as Record<string, (typeof planets)[0]>,
)

export default function PlanetSystem() {
  const systemRef = useRef<Group>(null)
  const { setActivePlanet, setPlanets, focusedPlanet } = usePlanetContext()
  const { currentTime } = useTimeContext()

  // State to store planet positions
  const [planetPositions, setPlanetPositions] = useState<Record<string, { x: number; y: number; z: number }>>({})

  // Set planets data in context
  setPlanets(planets)

  // Update the scale factor for astronomical calculations to make planets more visible
  useEffect(() => {
    // Calculate real astronomical positions with a smaller scale factor for better visibility
    const positions = getAllPlanetPositions(currentTime, 6) // Reduced scale factor for better spacing
    setPlanetPositions(positions)
  }, [currentTime])

  useFrame(({ clock }) => {
    if (systemRef.current && !focusedPlanet) {
      // Only apply gentle movement when not focused on a planet
      systemRef.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.05) * 0.05
    }
  })

  // Create planets with real positions
  const planetsWithPositions = planets.map((planet) => {
    // Skip the sun and black hole
    if (planet.id === "sun" || planet.id === "blackhole") return planet

    // Get calculated position if available
    const position = planetPositions[planet.id]
    if (position) {
      // Create a new planet object with updated position
      return {
        ...planet,
        realPosition: [position.x, position.y, position.z] as [number, number, number],
      }
    }

    // If no position data, return original planet
    return planet
  })

  return (
    <group ref={systemRef}>
      {planetsWithPositions.map((planet) => (
        <group key={planet.id}>
          {planet.isBlackHole ? (
            <BlackHole
              radius={planet.radius}
              position={planet.position}
              rotationSpeed={planet.rotationSpeed}
              onClick={() => setActivePlanet(planet)}
            />
          ) : (
            <ProceduralPlanet planet={planet} onClick={() => setActivePlanet(planet)} />
          )}

          {/* Render satellites if the planet has any */}
          {planet.satellites &&
            planet.satellites.map((satellite) => (
              <group key={satellite.id}>
                <ProceduralPlanet
                  planet={{
                    ...satellite,
                    // If planet has real position, use it as the center for the satellite orbit
                    // Otherwise use the orbital radius
                    position: planet.realPosition || [planet.orbitalRadius, 0, 0],
                    parentId: planet.id,
                  }}
                  onClick={() => setActivePlanet(satellite)}
                />
              </group>
            ))}
        </group>
      ))}
    </group>
  )
}

