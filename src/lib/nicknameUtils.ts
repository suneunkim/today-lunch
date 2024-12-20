const adjectives = [
  '조용한',
  '배고픈',
  '배부른',
  '졸린',
  '쌩쌩한',
  '활기찬',
  '피곤한',
  '상냥한',
  '나가고 싶은',
  '외근하는',
  '내근하는',
  '씩씩한',
  '행복한',
  '슬픈',
  '느긋한',
  '빠른',
  '느린',
  '용감한',
  '겁많은',
  '호기심 많은',
  '신중한',
  '게으른',
  '부지런한',
  '우울한',
  '기쁜',
  '화난',
  '멍한',
  '놀란',
  '웃고 있는',
  '긴장한',
  '자신감 넘치는',
  '똑똑한',
  '엉뚱한',
  '귀여운',
  '차분한',
  '깜찍한',
  '따뜻한',
  '차가운',
  '노련한',
  '풋풋한',
  '재밌는',
  '지루한',
  '적극적인',
  '수줍은',
  '화려한',
  '소박한',
  '행운의',
  '도전적인',
  '미식가',
  '창의적인',
  '예민한',
  '둔감한',
  '친절한',
  '야심찬',
  '진지한',
  '엉망인',
  '날카로운',
  '순수한',
  '의심 많은',
  '도도한',
  '소심한',
  '대담한',
  '미스터리한',
  '과묵한',
]

const getRandomNickname = () => {
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  return `${randomAdjective} 너굴`
}

export default getRandomNickname
