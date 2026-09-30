# TaskFlow Frontend

TaskFlow, ekiplerin çalışma alanları, projeler ve görevler üzerinden iş takibini yönetebilmesi için geliştirilmiş bir web uygulamasıdır.

Frontend tarafı **React, TypeScript ve Vite** kullanılarak geliştirilmiştir ve verileri NestJS tabanlı backend API üzerinden yönetir.

## Özellikler

- Kullanıcı kayıt ve giriş işlemleri
- Çalışma alanı oluşturma ve yönetme
- Proje oluşturma ve proje yönetimi
- Görev oluşturma, düzenleme ve silme
- Görev durumlarının ve önceliklerinin yönetilmesi
- Görev atama ve ekip üyesi yönetimi
- Görevler üzerinde yorum yapabilme
- Takvim görünümü ve tarih bazlı görev takibi
- Dashboard üzerinden çalışma alanı ve görev bilgilerinin görüntülenmesi
- Global arama
- Bildirim merkezi
- Profil ve çalışma alanı ayarları
- Responsive arayüz

## Kullanılan Teknolojiler

- **React**
- **TypeScript**
- **Vite**
- **CSS**
- **Vitest**
- **NestJS API** ile backend entegrasyonu

## Proje Yapısı

Frontend ve backend ayrı GitHub depolarında tutulmaktadır.

- **Frontend:** React + TypeScript + Vite
- **Backend:** NestJS + TypeScript + Prisma + SQLite

Frontend'in çalışabilmesi için backend API'nin de yerel olarak çalışıyor olması gerekir.

## Yerel Kurulum

### Gereksinimler

- Node.js 22 veya üzeri
- npm
- TaskFlow backend projesi

### 1. Projeyi klonla

```bash
git clone https://github.com/aygness35/taskflow-frontend.git
cd taskflow-frontend
```

### 2. Bağımlılıkları yükle

```bash
npm ci
```

### 3. Ortam değişkenlerini oluştur

`.env.example` dosyasını `.env.local` olarak kopyala:

```dotenv
VITE_API_URL=http://localhost:3000
```

### 4. Backend'i başlat

Backend projesini ayrı bir terminalde çalıştır:

```bash
npm run start:dev
```

Varsayılan backend adresi:

```text
http://localhost:3000
```

### 5. Frontend'i başlat

Frontend klasöründe:

```bash
npm run dev
```

Uygulama varsayılan olarak:

```text
http://localhost:3001
```

adresinde çalışır.

## Kullanılabilir Komutlar

| Komut             | Açıklama                                                 |
| ----------------- | -------------------------------------------------------- |
| `npm run dev`     | Geliştirme sunucusunu başlatır.                          |
| `npm run build`   | Production build oluşturur ve TypeScript kontrolü yapar. |
| `npm run preview` | Oluşturulan build'i yerel olarak önizler.                |
| `npm test`        | Mevcut testleri çalıştırır.                              |

## Temel Kullanım Akışı

1. Kullanıcı hesabı oluşturulur veya mevcut hesapla giriş yapılır.
2. Bir çalışma alanı oluşturulur.
3. Çalışma alanı içerisinde projeler oluşturulur.
4. Projelere görevler eklenir.
5. Görevler ekip üyelerine atanabilir ve durumları güncellenebilir.
6. Görevlere yorum eklenebilir.
7. Görevler dashboard, liste ve takvim görünümleri üzerinden takip edilebilir.
8. Global arama ve bildirim merkezi üzerinden uygulamadaki ilgili içeriklere erişilebilir.

## Geliştirme Notları

TaskFlow, ekip içi iş takibi ve proje yönetimi senaryolarını deneyimlemek amacıyla geliştirilmiş bir uygulamadır.

Frontend ve backend ayrı servisler olarak çalışır ve REST API üzerinden haberleşir.

Oturum bilgileri tarayıcı tarafında `sessionStorage` kullanılarak tutulmaktadır. Uygulamanın production ortamında kullanılabilmesi için deployment, kimlik doğrulama ve güvenlik yapılandırmalarının ayrıca ele alınması gerekir.

## Ekran Görünümleri

Uygulama; giriş, çalışma alanı, proje, görev, dashboard ve takvim gibi farklı ekranlardan oluşmaktadır.

## Katkı

Bu proje ekip çalışması kapsamında geliştirilmiştir. Frontend geliştirme, kullanıcı arayüzünün düzenlenmesi, API entegrasyonu ve uygulama akışlarının geliştirilmesi süreçlerinde katkı sağlanmıştır.
