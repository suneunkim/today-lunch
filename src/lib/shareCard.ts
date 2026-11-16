// 공유용 이미지 카드: "제안서" 모양의 그림을 기기에서 직접 그려 만듭니다.
export type CardLine = { label: string; sub?: string; checked?: boolean; badge?: string }

type CardOptions = {
  title: string
  meta?: string
  lines: CardLine[]
  stamped?: boolean
  showCheckbox?: boolean
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })

const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

const ORANGE = '#f47a3a'
const INK = '#19181b'

export const renderDocCard = async ({ title, meta, lines, stamped, showCheckbox }: CardOptions) => {
  const style = getComputedStyle(document.body)
  const heading = style.getPropertyValue('--font-paperlogy').trim() || 'sans-serif'
  const bodyFont = style.fontFamily || 'sans-serif'
  await Promise.all([
    document.fonts.load(`700 48px ${heading}`),
    document.fonts.load(`400 32px ${bodyFont}`),
  ]).catch(() => {})
  const character = await loadImage('/comment.png')

  const W = 1080
  const rowH = 132
  const paperH = 250 + lines.length * rowH + 60
  const H = paperH + 420
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = ORANGE
  ctx.fillRect(0, 0, W, H)

  // 종이 (뒤에 한 장 더 겹친 느낌)
  const px = 70
  const py = 90
  const pw = W - px * 2
  ctx.fillStyle = '#d1c9bd'
  roundRect(ctx, px + 20, py - 20, pw, paperH, 48)
  ctx.fill()
  ctx.fillStyle = '#fff'
  roundRect(ctx, px, py, pw, paperH, 48)
  ctx.fill()

  // 제목 줄
  const left = px + 64
  const right = px + pw - 64
  ctx.fillStyle = INK
  ctx.fillRect(left, py + 70, right - left, 5)
  ctx.fillRect(left, py + 190, right - left, 2)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = `600 50px ${bodyFont}`
  ctx.fillText(title, W / 2, py + 133)
  if (meta) {
    ctx.textAlign = 'right'
    ctx.fillStyle = '#7d7887'
    ctx.font = `400 28px ${bodyFont}`
    ctx.fillText(meta, right, py + 228)
  }

  // 항목
  ctx.textAlign = 'left'
  lines.forEach((line, i) => {
    const y = py + 300 + i * rowH
    let x = left
    if (line.badge) {
      ctx.fillStyle = line.checked ? ORANGE : '#f2f1f3'
      ctx.beginPath()
      ctx.arc(x + 36, y, 36, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = line.checked ? '#fff' : '#3e3c44'
      ctx.textAlign = 'center'
      ctx.font = `600 32px ${heading}`
      ctx.fillText(line.badge, x + 36, y + 2)
      ctx.textAlign = 'left'
      x += 100
    } else if (showCheckbox) {
      ctx.fillStyle = line.checked ? INK : '#fff'
      ctx.strokeStyle = line.checked ? INK : '#bebbc3'
      ctx.lineWidth = 3
      roundRect(ctx, x, y - 24, 48, 48, 10)
      ctx.fill()
      ctx.stroke()
      if (line.checked) {
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 6
        ctx.beginPath()
        ctx.moveTo(x + 11, y + 1)
        ctx.lineTo(x + 21, y + 11)
        ctx.lineTo(x + 38, y - 10)
        ctx.stroke()
      }
      x += 72
    }
    ctx.fillStyle = INK
    ctx.font = `700 46px ${heading}`
    ctx.fillText(line.label, x, line.sub ? y - 20 : y)
    if (line.sub) {
      ctx.fillStyle = '#7d7887'
      ctx.font = `400 28px ${bodyFont}`
      let sub = line.sub
      while (ctx.measureText(sub).width > right - x && sub.length > 4) sub = sub.slice(0, -2)
      ctx.fillText(sub === line.sub ? sub : sub + '…', x, y + 30)
    }
  })

  // 결재 도장
  if (stamped) {
    ctx.save()
    ctx.translate(px + pw - 150, py + 130)
    ctx.rotate(-0.22)
    ctx.strokeStyle = ORANGE
    ctx.fillStyle = ORANGE
    ctx.lineWidth = 8
    ctx.beginPath()
    ctx.arc(0, 0, 96, 0, Math.PI * 2)
    ctx.stroke()
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(0, 0, 80, 0, Math.PI * 2)
    ctx.stroke()
    ctx.textAlign = 'center'
    ctx.font = `700 56px ${heading}`
    ctx.fillText('결재', 0, -6)
    ctx.font = `600 24px ${heading}`
    ctx.fillText('먹대리', 0, 44)
    ctx.restore()
  }

  // 아래: 캐릭터와 서비스 이름
  const by = py + paperH + 50
  if (character) {
    const ch = 260
    const cw = (character.width / character.height) * ch
    ctx.drawImage(character, W - px - cw, by, cw, ch)
  }
  ctx.textAlign = 'left'
  ctx.fillStyle = '#fff'
  ctx.font = `700 60px ${heading}`
  ctx.fillText('오늘 점심은', px, by + 80)
  ctx.fillText('먹대리가', px, by + 156)
  ctx.font = `400 30px ${bodyFont}`
  ctx.fillText('점심메뉴 고르기', px, by + 224)

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('이미지 생성 실패'))), 'image/png')
  )
}
