import fs from "fs"
import fetch from "node-fetch"

const username = "CENGTOKSOY"

async function getContributions() {
  const query = `
    query {
      user(login: "${username}") {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
    },
    body: JSON.stringify({ query })
  })

  const data = await response.json()
  return data.data.user.contributionsCollection.contributionCalendar
}

function generateSVG(calendar) {
  const weeks = calendar.weeks
  let svg = `
  <svg width="900" height="300" xmlns="http://www.w3.org/2000/svg">
    <style>
      .cube { transition: 0.2s; }
      .cube:hover { opacity: 0.6; }
    </style>
  `

  let x = 20
  for (const week of weeks) {
    let y = 20
    for (const day of week.contributionDays) {
      const count = day.contributionCount
      const color = count === 0 ? "#222" : `hsl(${120 + count * 3}, 70%, 50%)`

      svg += `
        <rect class="cube" x="${x}" y="${y}" width="12" height="12" fill="${color}" />
      `
      y += 15
    }
    x += 15
  }

  svg += `</svg>`
  return svg
}

async function main() {
  const calendar = await getContributions()
  const svg = generateSVG(calendar)

  fs.writeFileSync("profile-3d-contrib/profile-night-view.svg", svg)
}

main()
