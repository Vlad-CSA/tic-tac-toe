#Tic Tac Toe

Технические особенности первой версии:
- В качестве View части использован React
- Визуальная стилевая библиотека - Bootstrap
- Работа с веб-сервером посредством fetch, ajax, Rest API
- благодаря этому реализована авторизация и разделение приложения на части доступные всем и доступные только
авторизованным пользователям

**Для входа использовать данные: username = username, password = password**

![screenshot of app](https://github.com/Piratt14/tic-tac-toe/blob/master/misc/Demo-version-1.jpg)

Будущая версия:
- Полноценная регистрация
- Сохранение статистики по всем партиям для разных людей
- Полносценный онлайн с разными людьми
- Back-end на Node.js, Socket.io, Heroku + maybe Mongodb / или сделать на Firebase как Serverless архитектура
- Реализовать систему подбора игроков и многое другое ...

Краткое описание:
- Для запуска надо скачать npm пакеты, для этого в консоли набрать npm install
- Для доступа к игре надо ввести верное имя пользоветеля и пароль, иначе будет выведено сообщение о неверных данных
- Если попытаться вручную перейти на нужный раздел приложения, без авторизации, то произойдет редирект на страницу входа
- Пользователь ходим "крестиком" и ходит первым, затем следует нажать кнопку **"Computer turn"** для того, что бы компьютер
 сделал случайный ход
- В любой момент времени можно переходить по истории ходов и менять ходы свои и компьютера(В рамках текущей партии)
- После победы одного из участников, или ничьей - надо нажать на кнопку **"Next Match"**
- Для выхода из игры(деавторизации) надо нажать на кнопку **"Exit"**
- В любой момент времени данные синхронизируются с сервером, поэтому можно продолжить незаконченную партию в любой
 момент после повторного входа.
Не важно как был осуществлен выход, по кнопке или закрыв страницу или браузер.
- Статистика матчей тоже сохраняется на сервере
- Под тремя кнопками "Computer Turn", "Next Match", "Exit" - показано кто ходит следующий, %username% или компьютер,
 так же там отображается в конце раунда кто победил или произошла ничья
- Если играть на хостинге, а не на локальной машине запустить через npm, то **Google Chrome** не подойдет из-за политики
 CORS и дополнительного необходимого атрибута в **cookie** файле(измнить этот простой веб-сервер я не могу так как
  исходников у меня нет, а делать hot-patch или изменить бинарный файл не моя специализация пока)
