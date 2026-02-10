# 장바구니 API 400 에러 – BE 확인용

## 1. 400 나는 흔한 원인

| 원인 | 설명 | 해결 |
|------|------|------|
| **키 이름 불일치** | FE가 `itemId` 등 camelCase로 보내면 400 | BE는 **`item_id`** (snake_case)만 허용 |
| **item_id 타입** | `item_id`를 숫자로 보내면 400 | **문자열만 허용** (예: `"uuid-값"`) |
| **JSON 아님** | body가 JSON 문자열이 아니면 400 | `Content-Type: application/json` 이고 body는 **JSON 문자열** |
| **인증** | body만 잘못된 경우 400 (401 아님) | 위 조건 맞추면 해결 |

---

## 2. FE에서 보내는 요청 (수정 후)

### POST /api/cart/items (장바구니 담기)

- **Headers**
  - `Content-Type: application/json`
  - `Authorization: Bearer {accessToken}` (로그인 시)
- **Body (JSON)**
  ```json
  {
    "item_id": "상품-uuid-문자열",
    "quantity": 1
  }
  ```
  - `item_id`: **항상 문자열** (UUID)
  - `quantity`: 숫자 (기본 1)
  - 선택: `title`, `price`, `image` (있으면 포함)

### PATCH /api/cart/items/:itemId

- **URL**: `itemId`는 **문자열** (UUID)
- **Body**: `{ "quantity": number }`

### DELETE /api/cart/items/:itemId

- **URL**: `itemId`는 **문자열** (UUID)

---

## 3. BE에서 검증할 것

1. **POST /api/cart/items**
   - body에 `item_id` (snake_case) 있는지
   - `typeof item_id === "string"` 인지
   - `Content-Type: application/json` 인지
2. **PATCH/DELETE**  
   - URL의 `:itemId`를 문자열로 파싱해 사용 (숫자로 변환하지 말 것)
