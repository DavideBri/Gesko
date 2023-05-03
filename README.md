# Gesko

Simple and minimal Jekyll blog. 
Forked from [Asko](https://github.com/manuelmazzuola/asko).
Original theme from [Sidey](https://github.com/ronv/sidey).

### Features

- [x] Responsive Design
- [x] Dark/Ligh theme 🌗
- [x] Inline CSS
- [x] Anchor headings
- [x] Tags & Tag pages 
- [x] 404 page 
- [x] Robots.txt 🤖
- [x] Atom & Json feeds 📡
- [x] Sass 
- [x] About page, with Timeline! 🗣️
- [x] PageSpeed and w3Validator tests PASSED ✔️
- [x] Search bar 🔎
- [x] Next & Previous Post ⏮️ ⏭️
- [x] Automatic/Manual reading time estimation 🕐
- [x] Disqus section (optional) ✍️ 


## Screenshot

![light-theme](https://github.com/DavideBri/Gesko/blob/master/light-theme.jpg)
![dark-theme](https://github.com/DavideBri/Gesko/blob/master/dark-theme.jpg)

## Installation

Be sure to have all [you need](https://jekyllrb.com/docs/installation/) before running anything. 

Run local server:

```bash
$ git clone https://github.com/DavideBri/Gesko.git
$ cd Gesko
$ bundle install
$ bundle exec jekyll build
$ bundle exec jekyll serve
```

Navigate to `localhost:4000`. You're Welcome, Fork and be Stargazer.
If you want to upload it to Github Pages, remember to update the `_congif.yml` and if you are going to upload in a repo called yournickname.github.io, remember to update the `{{ site.baseurl }}` to `{{ site.url }}` .
Note that there is also a gtag in the [`_layouts/default.html`](https://github.com/DavideBri/Gesko/blob/6776e4afc384dc3d50ce2001715929c8e70a914c/_layouts/default.html#L9), you should remove it.

To create new tag, create a folder in `tag/` with the name of the new one. In this folder add an `index.html` file and just add this header:
```
---
layout: tag
tag: yourNewTag
---
```
Then build again and you're ready!!

## Contributing

Yeaaa feel free to open a pull request.


If you see any typos or formatting errors in a post, or want to helping reduce backlogs or any other issue that needs to be addressed, please do not hesitate to open a pull request and fix it!, please read [contributing](./CONTRIBUTING.md) before PR.

## License

This project is open source and available under the [MIT License](LICENSE.md).
