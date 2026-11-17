// 화면 아래에 잠깐 뜨는 안내 문구. 어디서든 toast('...')로 부릅니다.
export const toast = (message: string) => {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('mukdaeri-toast', { detail: message }))
}
