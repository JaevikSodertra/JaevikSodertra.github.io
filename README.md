# jaeviksodertra.github.io

Персональный сайт и портфолио дата‑инженера Артёма Чернова. Статичный сайт на HTML, CSS и JavaScript.

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
