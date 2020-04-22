---
layout: default
title: "Audio"
description: "Miscellaneous audio that Chaim created."
published: true
---
# {{ page.title }}

Here are some recordings I created.

If you are using an iPad or iPhone, make sure that the silent mode switch on your device is off. Otherwise, the audio will not play.

## Episodes

{% assign tracks = site.audio | sort: 'order' %}
<ol class="post-list">
{% for track in tracks %}
  <li>
    <a href="{{ track.url }}">
      #{{ track.order }} – {{ track.title }}
    </a>
  </li>
{% endfor %}
</ol>

## Contributing

Help is welcome! If you would like to contribute to this project, please make a pull request to [this site on GitHub](https://github.com/chaimleib/chaimleib.github.io).

