# Gesko

Simple and minimal Jekyll blog. 
Forked from [Asko](https://github.com/manuelmazzuola/asko).
Inspired from [Klisé](https://github.com/piharpi/jekyll-klise)

Both had some issues with Github Pages, so I decided to make it work by losing as few features as possible.
Now easly deployable on Github Pages, with:

### Features

- [x] Responsive Design
- [x] Dark/Ligh theme
- [x] Inline CSS
- [x] Anchor headings
- [x] Tags & Tag pages
- [x] 404 page
- [x] Robots.txt
- [x] Atom & Json feeds
- [x] Sass
- [x] About page, with Timeline!
- [x] PageSpeed and w3Validator tests PASSED!
- [x] Search bar
- [x] Next & Previous Post

## Backlogs

- [ ] Improve SEO score on [Lighthouse](lighthouse_test.png) 



## Screenshot

![light-theme](https://github.com/P0WEX/Gesko/blob/master/light.png)
![dark-theme](https://github.com/P0WEX/Gesko/blob/master/dark.png)

## Installation

Run local server:

```bash
$ git clone https://github.com/P0WEX/Gesko.git
$ cd Gesko
$ bundle install
$ bundle exec jekyll serve
```

Navigate to `localhost:4000`. You're Welcome, Fork and be Stargazer.
If you want to upload it to Github Pages, remember to update the `_congif.yml` and if you are going to upload in a repo called yournickname.github.io, remember to update the `{{ site.baseurl }}` to `{{ site.url }}` 


## Contributing

If you see any typos or formatting errors in a post, or want to helping reduce backlogs or any other issue that needs to be addressed, please do not hesitate to open a pull request and fix it!, please read [contributing](./CONTRIBUTING.md) before PR.

Yeaaa feel free to open a pull request.

## License

This project is open source and available under the [MIT License](LICENSE.md).
