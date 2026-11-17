# 오늘 점심은 먹대리가

점심 메뉴를 대신 골라 주는 서비스입니다. 너구리 캐릭터 "먹대리"가 제안서를 올리면 도장을 찍어 결정하는 방식이고, 고른 메뉴를 근처에서 바로 찾을 수 있습니다.

- 웹: Next.js 정적 빌드 (서버 없음), Vercel 배포
- 앱: 같은 화면을 Capacitor로 감싼 안드로이드 앱
- 집계: Firebase Firestore (익명 횟수만 저장, 로그인 없음)

## 주요 기능

| 구분 | 기능 |
| --- | --- |
| 추천 | 카테고리(아무거나 포함 9개)와 요청 사항(안 맵게, 가볍게, 든든하게, 혼밥 가능, 가성비)으로 3안 제안 |
| 랜덤 뽑기 | 슬롯처럼 돌려 메뉴 하나를 바로 결정, 3일간 제외·아예 제외 |
| 취향 | 첫 실행 취향 조사(건너뛰기 가능), 못 먹는 것 7종 제외, 최근 먹은 메뉴 제외 |
| 지도 | 회사 근처 역·동네 기준으로 카카오맵·네이버 지도 검색, 메뉴별 단골집 메모 |
| 날씨 | 현재 날씨 또는 직접 고른 날씨에 맞는 메뉴 |
| 기록 | 하루 한 끼 기록, 이번 달 종류별·형태별 분포 |
| 내기 | 누가 쏠까(룰렛, 사다리 타기), N빵 계산기 |
| 휴게실 | 메뉴 월드컵, 오늘의 점심 운세, 스피드 주문받기, 점심 질주, 버거 쌓기, 점심시간 10초 전 |
| 그 밖에 | 평일 점심 30분 전 알림, 제안서·결과 이미지 공유, 이용 현황 |

메뉴는 약 310종이고 `src/app/data/menus.ts` 한 파일에서 관리합니다.

## 실행

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # out/ 폴더에 정적 파일 생성
npm run app:sync     # 웹 빌드 + 안드로이드 프로젝트에 반영
```

집계를 켜려면 `.env.example`을 `.env.local`로 복사해 Firebase 웹 API 키를 넣습니다. 키가 없어도 앱은 동작합니다.

앱 빌드와 Play 스토어 출시 방법은 [docs/APP_RELEASE.md](docs/APP_RELEASE.md)에 있습니다. GitHub에 올리면 Actions가 APK를 자동으로 만듭니다.

## 폴더 구조

| 위치 | 내용 |
| --- | --- |
| `src/app/<화면>/` | 화면별 페이지 (home, result, slot, office, games, history, settings 등) |
| `src/app/data/` | 메뉴, 월드컵 출전 메뉴, 띠별 한마디 문구 |
| `src/lib/recommend.ts` | 추천 로직 (취향 가중치, 제외 규칙) |
| `src/lib/storage.ts` | 기기에 저장하는 설정·기록 |
| `src/lib/firebase/stats.ts` | 이용 집계와 순위 |
| `src/lib/native.ts` | 알림·공유 등 앱 전용 기능 |
| `android/` | Capacitor 안드로이드 프로젝트 |
| `firestore.rules` | Firestore 보안 규칙 (콘솔에 붙여 넣어 사용) |

## 만든 사람들

기획·개발과 캐릭터·디자인 참여자는 앱의 설정 → 프로젝트 팀 소개에 있습니다.

---

# 웹 버전(2024) 개발 기록

아래는 처음 웹 서비스로 만들 때의 기록입니다. 서버 컴포넌트, fetch 캐싱, 카카오 공유, OpenWeather 관련 내용은 지금 코드와 다릅니다(현재는 서버 없이 기기에서 처리하고, 날씨는 Open-Meteo, 공유는 기기 공유창을 씁니다).

## 주요 기능
### 1. 사용자 선호 카테고리 기반 추천
- 음식 카테고리(한식, 중식, 일식 등)를 다중 선택한 후, 관련 메뉴 3가지 추천

### 2. 날씨 기반 추천

- 현재 날씨와 기온에 따라 적합한 메뉴를 추천

- 기본 지역은 서울이며, 사용자가 위치 정보를 불러올 수 있음.

### 3. Lottie 애니메이션을 활용한 UI/UX 강화

- 결과 페이지로 전환 시 부드럽고 세련된 시각 효과 제공

### 4. 메타데이터와 카카오톡 공유 기능

- 각 페이지별로 메타데이터를 설정하여 검색 최적화
- 추천 메뉴를 카카오톡으로 간편히 공유 가능
  
## 기술적 의사결정

### 1. Next.js App Router 활용

- 서버 컴포넌트를 적극적으로 사용해 페이지별 SEO 최적화 및 Lighthouse SEO 점수 100점 달성

### 2. 구글 서치 콘솔 및 Google Analytics 연동

- 방문자 수 추적 및 검색 노출 최적화
  
### 3. API 기반 동적 메뉴 추천
- 날씨와 기온을 고려한 데이터 기반 동적 추천

## 성능 및 최적화
### 1. 날씨 API 요청 최적화

- 기본값으로 서울의 날씨 정보를 요청하며, 사용자의 위도/경도를 받아와 근접한 도시를 매칭하여 city 기반 API 호출
- 주요 도시 목록을 기준으로 캐싱하여 요청 효율성을 극대화
- 주요 도시 목록: 서울, 부산, 대구, 인천, 광주, 대전, 울산, 춘천, 전주, 마산, 제주.

### 2. Next.js의 Fetch 캐싱 전략

- API 호출 URL을 도시 단위로 고정하여 캐싱 효과 극대화.
- fetch를 통해 2시간마다 재검증(revalidate) 처리.

  
### 3. 메타데이터 설정을 통한 SEO 최적화

- 페이지별 키워드와 설명을 동적으로 설정하여 검색 가능성을 높임

  
## 날씨 맞춤 추천 서비스
이 서비스는 날씨 API를 활용하여 사용자의 위치 도시의 날씨 정보를 받아오고, 해당 정보를 기반으로 적합한 메뉴를 추천합니다.

### 1️⃣ 서버 컴포넌트를 통한 날씨 데이터 처리
기본값 설정: 사용자가 도시를 지정하지 않으면 기본값으로 서울의 날씨 정보를 요청합니다.
날씨 데이터 요청 함수:
weatherService.ts의 getWeatherByCity 함수는 OpenWeather API를 사용하여 도시 이름을 기반으로 날씨 데이터를 가져옵니다.


```jsx
const page = async ({ searchParams }: { searchParams: Params }) => {
  const { city } = (await searchParams) ?? 'Seoul';

  const weatherData = await getWeatherByCity(city);

  return (
    <Container title="날씨 맞춤 메뉴">
      <div className="flex flex-col gap-6 mt-6 mb-[147px] px-5">
        <WeatherContent weatherData={weatherData} />
        <KakaoShareButton page="weather" />
      </div>
    </Container>
  );
};

```

### 2️⃣ 주요 도시 기반 캐싱 최적화

#### 최적화 전략:
위도와 경도로 날씨 데이터를 요청하지 않고, 주요 도시와 가장 가까운 도시를 찾아 API 호출 시 도시 이름만을 사용합니다. 이렇게 하면 동일 도시 요청에 대해 URL이 고정되며, Next.js의 빌트인 fetch 캐싱 기능을 활용할 수 있습니다.

```jsx
export const findNearestCity = (lat: number, lon: number) => {
  let nearestCity = MAJOR_CITIES.SEOUL;
  let minDistance = Infinity;

  Object.values(MAJOR_CITIES).forEach((city) => {
    const distance = Math.sqrt(Math.pow(lat - city.lat, 2) + Math.pow(lon - city.lon, 2));
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city;
    }
  });

  return nearestCity.name;
};

```

### 3️⃣ 날씨에 따른 데이터 변환 및 UI 처리

#### 데이터 변환: 
API에서 제공받은 데이터를 사용자가 이해하기 쉽도록 한국어로 변환하고, 기온은 소수점을 제거하여 정수로 표시합니다.
예를 들어, Clear → 맑음, Rain → 비로 변환합니다.

#### UI 반영: 
날씨 상태에 따라 배너 색상과 아이콘을 동적으로 변경하여 직관적인 인터페이스를 제공합니다.

```jsx
export const weatherBackgroundColors = {
  clear: `linear-gradient(90deg, #C2E9FB 0%, #A1C4FD 100%)`,
  clouds: `linear-gradient(90deg, #BCC5CE 0%, #929EAD 98%)`,
  rain: `linear-gradient(90deg, #D1E9FF 0%, #C3CFE2 100%)`,
  snow: `linear-gradient(90deg, #EFF6FF 0%, #E3F2FD 100%)`,
};

```

#### 4️⃣ 날씨 및 기온에 따른 메뉴 추천

###  필터링 로직:

특정 날씨 조건(Rain, Snow, Clear)에 맞는 메뉴를 필터링.
날씨 필터링된 메뉴에서 기온 조건(Cold, Hot)에 맞는 메뉴를 추가 필터링.

### 사용 예시:
Rain → "비 오는 날 어울리는 따뜻한 음식"
Cold → "추운 날 어울리는 따뜻한 국물 요리"

```jsx
const weatherFilteredMenus = getWeatherFilteredMenus(전체메뉴, apiWeather);
const tempFilteredMenus = getTemperatureFilteredMenus(전체메뉴, tempCondition, weatherFilteredMenus);
```






