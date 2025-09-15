;; StudentCertDApp - Certificate Smart Contract
;; Bu contract öğrenci sertifikalarının NFT benzeri tokenlar olarak yönetimini sağlar
;; Üniversiteler sertifika mint edebilir, öğrenciler sahipliği transfer edebilir
;; Üçüncü taraflar sertifikaları doğrulayabilir

;; === CONSTANTS ===
;; Hata kodları
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-CERTIFICATE-NOT-FOUND (err u101))
(define-constant ERR-ALREADY-EXISTS (err u102))
(define-constant ERR-INVALID-INPUT (err u103))
(define-constant ERR-NOT-OWNER (err u104))
(define-constant ERR-INSTITUTION-NOT-REGISTERED (err u105))
(define-constant ERR-INVALID-CERTIFICATE-DATA (err u106))

;; Maksimum string uzunlukları
(define-constant MAX-NAME-LENGTH u100)
(define-constant MAX-DESCRIPTION-LENGTH u500)
(define-constant MAX-INSTITUTION-LENGTH u100)

;; === DATA VARIABLES ===
;; Contract owner (deploy eden kişi)
(define-data-var contract-owner principal tx-sender)
;; Toplam sertifika sayısı
(define-data-var certificate-counter uint u0)

;; === DATA MAPS ===
;; Kayıtlı eğitim kurumları (sadece bunlar sertifika mint edebilir)
(define-map registered-institutions 
  principal 
  {
    name: (string-ascii 100),
    is-active: bool,
    registered-at: uint
  }
)

;; Sertifika metadata'sı
(define-map certificates
  uint ;; certificate-id
  {
    student: principal,
    institution: principal,
    program-name: (string-ascii 100),
    description: (string-ascii 500),
    issue-date: uint,
    expiry-date: (optional uint),
    grade: (optional (string-ascii 10)),
    is-revoked: bool
  }
)

;; Sertifika sahipliği (NFT benzeri)
(define-map certificate-owners
  uint ;; certificate-id
  principal ;; owner
)

;; Öğrenci sertifikaları
(define-map student-certificates
  principal ;; student
  (list 50 uint) ;; certificate-ids listesi
)

;; Kurum sertifikaları
(define-map institution-certificates
  principal ;; institution
  (list 100 uint) ;; certificate-ids listesi
)

;; === PRIVATE FUNCTIONS ===

;; String uzunluğu kontrolü
(define-private (validate-string-length (str (string-ascii 500)) (max-len uint))
  (<= (len str) max-len)
)

;; Sertifika ID'sinin geçerliliğini kontrol etme
(define-private (is-valid-certificate-id (certificate-id uint))
  (and
    (> certificate-id u0)
    (<= certificate-id (var-get certificate-counter))
  )
)

;; === READ-ONLY FUNCTIONS ===

;; Contract owner'ı getir
(define-read-only (get-contract-owner)
  (var-get contract-owner)
)

;; Toplam sertifika sayısını getir
(define-read-only (get-certificate-count)
  (var-get certificate-counter)
)

;; Kurumun kayıtlı olup olmadığını kontrol et
(define-read-only (is-institution-registered (institution principal))
  (match (map-get? registered-institutions institution)
    institution-data (get is-active institution-data)
    false
  )
)

;; Kurum bilgilerini getir
(define-read-only (get-institution-info (institution principal))
  (map-get? registered-institutions institution)
)

;; Sertifika bilgilerini getir
(define-read-only (get-certificate (certificate-id uint))
  (if (is-valid-certificate-id certificate-id)
    (map-get? certificates certificate-id)
    none
  )
)

;; Sertifika sahibini getir
(define-read-only (get-certificate-owner (certificate-id uint))
  (if (is-valid-certificate-id certificate-id)
    (map-get? certificate-owners certificate-id)
    none
  )
)

;; Öğrencinin sertifikalarını getir
(define-read-only (get-student-certificates (student principal))
  (default-to (list) (map-get? student-certificates student))
)

;; Kurumun mint ettiği sertifikaları getir
(define-read-only (get-institution-certificates (institution principal))
  (default-to (list) (map-get? institution-certificates institution))
)

;; Sertifikanın geçerli olup olmadığını kontrol et 
(define-read-only (is-certificate-valid (certificate-id uint))
  (match (get-certificate certificate-id)
    certificate-data
      (and
        (not (get is-revoked certificate-data))
        (match (get expiry-date certificate-data)
          expiry-date (<= block-height expiry-date)
          true ;; expiry-date yoksa süresiz geçerli
        )
      )
    false
  )
)

;; Sertifikayı doğrula (üçüncü taraflar için)
(define-read-only (verify-certificate 
  (certificate-id uint) 
  (expected-student principal)
  (expected-institution principal)
)
  (match (get-certificate certificate-id)
    certificate-data
      {
        exists: true,
        valid: (is-certificate-valid certificate-id),
        student-match: (is-eq (get student certificate-data) expected-student),
        institution-match: (is-eq (get institution certificate-data) expected-student),
        certificate-data: certificate-data
      }
    {
      exists: false,
      valid: false,
      student-match: false,
      institution-match: false,
      certificate-data: none
    }
  )
)

;; === PUBLIC FUNCTIONS ===

;; Contract owner'ı değiştir (sadece mevcut owner)
(define-public (set-contract-owner (new-owner principal))
  (if (is-eq tx-sender (var-get contract-owner))
    (begin
      (var-set contract-owner new-owner)
      (ok true)
    )
    ERR-NOT-AUTHORIZED
  )
)

;; Eğitim kurumu kaydet (sadece contract owner)
(define-public (register-institution 
  (institution principal) 
  (name (string-ascii 100))
)
  (if (is-eq tx-sender (var-get contract-owner))
    (if (validate-string-length name MAX-INSTITUTION-LENGTH)
      (if (is-none (map-get? registered-institutions institution))
        (begin
          (map-set registered-institutions institution {
            name: name,
            is-active: true,
            registered-at: block-height
          })
          (ok true)
        )
        ERR-ALREADY-EXISTS
      )
      ERR-INVALID-INPUT
    )
    ERR-NOT-AUTHORIZED
  )
)

;; Kurumu aktif/pasif yap (sadece contract owner)
(define-public (toggle-institution-status (institution principal))
  (if (is-eq tx-sender (var-get contract-owner))
    (match (map-get? registered-institutions institution)
      institution-data
        (begin
          (map-set registered-institutions institution 
            (merge institution-data { is-active: (not (get is-active institution-data)) })
          )
          (ok true)
        )
      ERR-INSTITUTION-NOT-REGISTERED
    )
    ERR-NOT-AUTHORIZED
  )
)

;; Sertifika mint et (sadece kayıtlı kurumlar)
(define-public (mint-certificate
  (student principal)
  (program-name (string-ascii 100))
  (description (string-ascii 500))
  (expiry-date (optional uint))
  (grade (optional (string-ascii 10)))
)
  ;; Kurum kayıtlı ve aktif mi kontrol et
  (if (is-institution-registered tx-sender)
    ;; Input validasyonu
    (if (and 
          (validate-string-length program-name MAX-NAME-LENGTH)
          (validate-string-length description MAX-DESCRIPTION-LENGTH)
        )
      (let
        (
          (new-certificate-id (+ (var-get certificate-counter) u1))
        )
        ;; Yeni sertifika oluştur
        (map-set certificates new-certificate-id {
          student: student,
          institution: tx-sender,
          program-name: program-name,
          description: description,
          issue-date: block-height,
          expiry-date: expiry-date,
          grade: grade,
          is-revoked: false
        })
        
        ;; Sahipliği öğrenciye ata
        (map-set certificate-owners new-certificate-id student)
        
        ;; Öğrencinin sertifika listesini güncelle
        (map-set student-certificates student 
          (unwrap-panic (as-max-len? 
            (append (get-student-certificates student) new-certificate-id) 
            u50
          ))
        )
        
        ;; Kurumun sertifika listesini güncelle
        (map-set institution-certificates tx-sender
          (unwrap-panic (as-max-len?
            (append (get-institution-certificates tx-sender) new-certificate-id)
            u100
          ))
        )
        
        ;; Counter'ı artır
        (var-set certificate-counter new-certificate-id)
        
        (ok new-certificate-id)
      )
      ERR-INVALID-INPUT
    )
    ERR-INSTITUTION-NOT-REGISTERED
  )
)

;; Sertifikayı revoke et (sadece mint eden kurum)
(define-public (revoke-certificate (certificate-id uint))
  (match (get-certificate certificate-id)
    certificate-data
      (if (is-eq tx-sender (get institution certificate-data))
        (begin
          (map-set certificates certificate-id 
            (merge certificate-data { is-revoked: true })
          )
          (ok true)
        )
        ERR-NOT-AUTHORIZED
      )
    ERR-CERTIFICATE-NOT-FOUND
  )
)

;; Sertifika sahipliğini transfer et (sadece mevcut sahip)
(define-public (transfer-certificate (certificate-id uint) (new-owner principal))
  (match (get-certificate-owner certificate-id)
    current-owner
      (if (is-eq tx-sender current-owner)
        (begin
          ;; Sahipliği değiştir
          (map-set certificate-owners certificate-id new-owner)
          
          ;; Eski sahibin listesinden çıkar
          (map-set student-certificates current-owner
            (filter is-not-transferred-cert (get-student-certificates current-owner))
          )
          
          ;; Yeni sahibin listesine ekle
          (map-set student-certificates new-owner
            (unwrap-panic (as-max-len?
              (append (get-student-certificates new-owner) certificate-id)
              u50
            ))
          )
          
          (ok true)
        )
        ERR-NOT-OWNER
      )
    ERR-CERTIFICATE-NOT-FOUND
  )
)

;; Transfer işlemi için yardımcı fonksiyon
(define-private (is-not-transferred-cert (cert-id uint))
  (not (is-eq cert-id certificate-id))

)
