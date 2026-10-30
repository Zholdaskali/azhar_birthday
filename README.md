# GitHub Pages

Пакет содержит только сайт приглашения и workflow. Файлы Sites, .git и материалы другого проекта HACK не включены.

Для размещения в отдельном репозитории:

1. Загрузить `dist/` и `.github/workflows/pages.yml`, сохранив структуру папок.
2. В репозитории открыть Settings → Pages → Build and deployment → Source → GitHub Actions.
3. Запустить workflow «Publish invitation to GitHub Pages» на основной ветке или отправить коммит с изменениями dist/ в main/master.
4. Успешный шаг Deploy вернёт настоящий URL. До успешного запуска адрес не считается опубликованным.

Для простого размещения без Actions можно загрузить содержимое dist/ в корень отдельного репозитория и выбрать Settings → Pages → Deploy from a branch → main → /(root).

Все ссылки на CSS, JS и картинки относительные: сайт работает и на домене пользователя, и в подпапке репозитория. RSVP отправляется через WhatsApp вручную гостьей. В пакете есть домашний адрес и номер, ранее согласованные для публикации в приглашении.

Документация: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
