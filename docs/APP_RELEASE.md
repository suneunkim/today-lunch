# 앱 출시 가이드 (안드로이드)

웹 화면(Next.js 정적 빌드)을 Capacitor로 감싼 앱입니다. 서버가 없어서 유지비가 들지 않습니다.

## 구조 한눈에 보기

| 무엇 | 어디 |
| --- | --- |
| 메뉴 목록 (한 줄 = 메뉴 하나) | `src/app/data/menus.ts` |
| 추천 로직 (취향·최근 먹은 메뉴 제외) | `src/lib/recommend.ts` |
| 기기에 저장되는 설정·기록 | `src/lib/storage.ts` |
| 이용 집계 (Firestore) | `src/lib/firebase/stats.ts`, 화면은 `/stats` |
| 알림·공유 (앱 전용 기능) | `src/lib/native.ts` |
| 안드로이드 프로젝트 | `android/` |
| 자동 빌드 | `.github/workflows/android.yml` |

## 1. 설치 파일(APK) 받기

1. GitHub 레포 → **Actions** → "Android 앱 빌드" → 가장 최근 실행을 엽니다.
2. 아래 **Artifacts**의 `mukdaeri-debug-apk`를 내려받아 압축을 풀면 `app-debug.apk`가 나옵니다.
3. 안드로이드 폰으로 옮겨 설치합니다. (출처를 알 수 없는 앱 설치 허용 필요)

## 2. 집계 켜기 (Firebase)

1. Firebase 콘솔에서 `today-lunch-68bf2` 프로젝트를 엽니다.
2. 프로젝트 설정 → 일반 → 내 앱에서 **웹 API 키**를 복사합니다.
3. GitHub 레포 → Settings → Secrets and variables → Actions → **New repository secret**
   - 이름 `NEXT_PUBLIC_FIREBASE_API_KEY`, 값은 복사한 키
4. Firestore Database → **규칙**에 레포의 `firestore.rules` 내용을 붙여 넣고 게시합니다.
5. Actions에서 빌드를 다시 실행하면 집계가 켜진 APK가 만들어집니다.

집계는 앱 안의 **이용 현황**(화면 맨 아래 링크, `/stats`)에서 봅니다.

## 3. Play 스토어 출시

1. Google Play Console 개발자 계정 등록 (1회 $25).
2. 앱 만들기 → 패키지 이름은 `com.mukdaeri.todaylunch` (`capacitor.config.ts`, 출시 후 변경 불가).
3. 서명 키 만들기 (맥 터미널, 한 번만. **파일과 비밀번호를 잃어버리면 업데이트를 못 올립니다**):
   ```bash
   keytool -genkey -v -keystore release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias mukdaeri
   base64 -i release.jks | pbcopy   # 클립보드에 복사됨
   ```
4. GitHub Secrets에 4개 추가: `ANDROID_KEYSTORE_BASE64`(방금 복사한 값), `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`(`mukdaeri`), `ANDROID_KEY_PASSWORD`
5. Actions → "Android 앱 빌드" → **Run workflow** → "출시용 AAB도 만들기" 체크 → Artifacts의 `mukdaeri-release-aab`를 받습니다.
6. Play Console → 테스트 → **비공개 테스트**에 AAB 업로드, 테스터 12명 이상 초대 → 14일 유지 → 프로덕션 신청.
7. 스토어 등록 정보에 필요한 것
   - 앱 아이콘 512px: `store/icon-512.png` (임시 제작본. 디자이너 원본으로 교체 권장)
   - 스크린샷 2장 이상, 그래픽 이미지 1024×500
   - 개인정보처리방침 URL: 웹에 배포한 뒤 `/privacy/` 주소 사용
   - 데이터 보안 양식: "앱 활동(익명 이용 통계)" 수집, 위치는 수집·공유 안 함(기기 내 처리)

## 4. 수정하고 다시 빌드하기

```bash
npm install
npm run dev          # 브라우저에서 확인 (http://localhost:3000)
npm run app:sync     # 웹 빌드 + 안드로이드 프로젝트에 반영
npm run app:open     # Android Studio로 열기 (설치되어 있을 때)
```

GitHub에 올리면(push) APK는 자동으로 다시 만들어집니다.

## iOS는 나중에

`npm i @capacitor/ios && npx cap add ios` 후 Xcode로 빌드합니다. Apple Developer Program(연 $99)이 필요합니다.
