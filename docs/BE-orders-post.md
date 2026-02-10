# POST /api/orders (구매 요청 생성) – 400 방지용

## FE가 보내는 body (snake_case)

FE는 아래 형태로 **JSON** 전송합니다.

```json
{
  "items": [
    {
      "item_id": "상품-uuid-문자열",
      "title": "상품명",
      "quantity": 2,
      "price": 2000,
      "image": "https://..."
    }
  ],
  "total_quantity": 24,
  "total_amount": 240000,
  "request_message": "선택 시에만 있음"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `items` | array | O | 주문할 상품 목록 |
| `items[].item_id` | string | O | 상품 ID (문자열) |
| `items[].title` | string | O | 상품명 |
| `items[].quantity` | number | O | 수량 |
| `items[].price` | number | O | 단가 |
| `items[].image` | string | X | 이미지 URL |
| `total_quantity` | number | O | 총 수량 |
| `total_amount` | number | O | 총 금액 |
| `request_message` | string | X | 요청 메시지 (있을 때만) |

- **Content-Type**: `application/json`
- **Authorization**: `Bearer {accessToken}` (로그인 시)

---

## 400 나는 흔한 원인

| 원인 | 해결 |
|------|------|
| 키가 camelCase (`totalQuantity`, `itemId`) | FE는 이미 snake_case로 보냄. BE는 `total_quantity`, `item_id` 로 받기 |
| `item_id`를 숫자로 기대/변환 | **문자열만** 허용 (UUID) |
| `items`가 없거나 빈 배열 | 필수. 비어 있으면 400 대신 422 등으로 명시 가능 |
| body가 JSON이 아님 / 파싱 실패 | `Content-Type: application/json` 확인 |

BE에서 위 필드 이름(snake_case)과 타입만 맞추면 400을 줄일 수 있습니다.
