# jaeviksodertra.github.io

Персональный сайт и портфолио дата‑инженера. Статичный сайт на HTML, CSS и JavaScript.

## Используемые технологии
- HTML5
- CSS3
- JavaScript (vanilla)
- GitHub Pages

## Запуск локально
1. Клонировать репозиторий:
   ```bash
   git clone https://github.com/JaevikSodertra/JaevikSodertra.github.io.git
   ```
2. Перейти в каталог:
   ```bash
   cd JaevikSodertra.github.io
   ```
3. Запустить локальный сервер и открыть сайт в браузере:
   ```bash
   python3 -m http.server 8000
   ```
   Сайт будет доступен по адресу <http://localhost:8000>.

## Обновление контента
1. Внесите изменения в HTML, CSS или JS файлы.
2. Проверьте локально, что всё работает.
3. Закоммитьте и отправьте изменения:
   ```bash
   git add .
   git commit -m "Update content"
   git push origin main
   ```

## Деплой на GitHub Pages
Репозиторий `JaevikSodertra/JaevikSodertra.github.io` автоматически публикуется через GitHub Pages из ветки `main`. После отправки коммита подождите несколько минут и проверьте сайт по адресу <https://jaeviksodertra.github.io/>.

## Статистика посещений
На сайте подключён self-hosted [Plausible](https://plausible.io/) (`https://plausible.example.com`, домен `jaeviksodertra.github.io`).

Посмотреть метрики можно в панели <https://plausible.example.com/jaeviksodertra.github.io> (нужны учётные данные).

### Исключение собственных визитов
Чтобы не учитывать свою активность, один раз откройте сайт с параметром `?no-track`:

```
https://jaeviksodertra.github.io/?no-track
```

Страница установит флаг `plausible_ignore` в `localStorage`, и дальнейшие посещения с этого браузера не будут попадать в статистику. Чтобы снова считать визиты, удалите этот ключ из `localStorage`.
