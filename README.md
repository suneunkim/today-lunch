# today-lunch

오늘 점심 메뉴, 먹대리가 제안해드립니다!

사용자의 선호 카테고리와 날씨에 맞춘 맞춤형 점심 메뉴를 추천하는 웹 애플리케이션입니다.

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






