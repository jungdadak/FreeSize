# Freesize

**Freesize**는 사용자가 업로드한 이미지를 변환 및 비교하고, 변환된 결과를 다운로드할 수 있는 웹 애플리케이션입니다. 
Next.js(프론트엔드), FastAPI(AI 기능), Spring(이미지 처리 API) 기반으로 구축되었으며,이 repo는 Next.js에 해당합니다.
사용자 권한설정과 관리자 페이지 담당 데이터베이스는 Prisma를 이용한 AWS RDS의 PostgreSQL을, 
사용자 업로드 파일 스토리지는 AWS S3를 사용합니다.

Https timeout 문제 해결을 위해 Polling 방식을 채택하고, s3key와 버킷 주소등을 사용자에게 노출하지 않기 위한 프록시 api를 두었습니다. 

## 주요 기능
### 📂 파일 업로드 및 미리보기
- 사용자는 이미지를 업로드하고 미리보기를 확인할 수 있습니다.
- 개별 이미지 및 전체 이미지에 동일한 설정을 적용할 수 있습니다.

### 🔄 이미지 변환 및 처리
- **업스케일(Upscale)**: 해상도를 향상시키는 기능
- **언크롭(Uncrop)**: 잘린 이미지를 복원하는 기능
- **스퀘어(Square)**: 이미지를 정사각형으로 변환하는 기능
- 변환된 이미지는 `.zip` 파일로 다운로드할 수 있습니다.
- 업스케일 적용 시 원본 이미지와 비교할 수 있는 기능 제공

### 🆚 이미지 비교
- 처리 전/후 이미지를 슬라이드 또는 비교 UI를 통해 확인할 수 있습니다.

### 🔑 로그인 및 사용자 인증
- **shadcn** UI를 활용한 로그인 및 인증 기능
- AWS RDS의 PostgreSQL을 이용한 Prisma 기반 인증 시스템
- **auth.js**를 활용한 인증 관리

### 🛠️ 관리자 페이지
- 현재 서비스의 상태를 조절할 수 있는 관리 기능 제공
- Prisma를 활용하여 RDS 기반의 사용자 인증 및 권한 관리

### 🔍 SEO 최적화 및 광고 수익화
- **Next.js의 SSR 및 SSG**를 활용하여 SEO 최적화
- **메타 태그 및 Open Graph** 설정을 통해 검색 엔진 가시성 향상
- **Google AdSense 통합**으로 광고 수익 창출 가능 **(현재 진행중)**

## 기술 스택
### 🖥️ Frontend
- **Next.js** (React, TypeScript, Turbopack)
- **Tailwind CSS** (스타일링)
- **shadcn UI** (로그인 및 UI 컴포넌트)
- **Zustand** (상태 관리)
- **TanStack Query** (데이터 패칭 및 캐싱)

### 🖥️ Backend (NextApi)
- **Prisma** (AWS RDS의 PostgreSQL ORM 및 마이그레이션 관리)
- **AWS S3** (이미지 파일 저장소)


