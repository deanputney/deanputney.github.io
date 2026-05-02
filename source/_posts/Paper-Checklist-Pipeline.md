---
title: Voice to Paper Checklist
date: 2025-03-20 14:37:00
tags:
  - ai
  - stardate
---

![Paper checklist on a 4x6 index card with a handful of items to complete on Thursday. It's neatly laid out with checkboxes and details for each item. [wide]](IMG_8588.jpeg)

It's satisfying to cross things off a paper checklist. A paper checklist can't interrupt you. At the end of the day you can add it to a growing little stack on your desk and feel accomplished.

Printers are also amazing. Computer laid out text is neat and organized. A perfectly square checkbox feels authoritative.

I've been experimenting in earnest with ways to make an efficient pipeline for printing a daily agenda. This latest version finally got the pieces coming together.

My goals for this project are:

- Easy and streamlined. Don't overthink it.
- Local to my devices– no external AI or tools.
- Purposeful and useful.

### TL;DR

1. Dictate my daily to-dos to [Stardate](https://stardateapp.com).
2. Format today's Stardate notes from iCloud Drive with [LLM](https://llm.datasette.io/en/stable/).
3. Slap it into a [LaTeX](https://www.latex-project.org/get/) template.
4. Print to a 4x6 index card.

<!-- more -->

## Format

I've experimented with receipt paper like the [Little Printer](https://nordprojects.co/projects/littleprinters/), and I sure wish I could make that work well for my purposes. Ultimately I've decided this is more romantic than practical, and having a roll of paper to print on just begs for scope creep.

Index cards are great. Just enough space for a day's intentions.

I've used 3x5 index cards for checklists before. When I discovered that my thrifted-and-indestructible Brother laser printer has a secret single sheet slot that supports a 4x6 card the solution seemed obvious.

![Brother laser printer's secret slot!](IMG_8585.jpeg)

## Layout

Great, so we know we're doing a 4x6 index card. How do we design for it?

I tried several things here and was left unsatisfied by most of them. Google Docs is a nightmare for small formats. Apple Pages can do it, but the checkboxes are hideous. Markdown would be an obvious choice for easy organization of text, but rendering seemed like a bit of a mess.

Then I remembered [good ol' LaTeX](https://www.latex-project.org/)!

LaTeX is kind of perfect for this application.

1. It can handle a complex layout with fine-grained control over the type.
2. Similar to Markdown, the layout is done entirely in text. This makes copying items into a template easy, or even controlling it via a script.
3. Unlike other markup languages like HTML, it's designed to be rendered in a printed form. So doing things like making a 4x6 document is easy.

Also because it's just text, LLMs are familiar with the structure and can help write it. I did just that and [came up with this template](https://gist.github.com/deanputney/d48f55e0b013227f4e850c2fa4fdba02) in a few minutes of back and forth with ChatGPT. A fine start!

## Input

I'm starting small here. Rather than try to connect a bunch of data sources together like my calendar or task management apps, I dictate a few notes to my app [Stardate](https://stardateapp.com/) while I'm making breakfast. Usually I roughly know what I'm doing today (or what I want to do), so it's better to think aloud than try to have something assembled for me.

Stardate takes voice notes from your Apple Watch or iPhone and transcribes them locally using Whisper for free. A lesser-known feature of Stardate is that all your notes are saved to your iCloud Drive as text files. This makes them super easy to grab today's notes on the Mac. These files should live in the same place for everyone:

```bash
~/Library/Mobile\ Documents/iCloud~com~deanputney~Stardate/Documents/
```

There are two directories in here by default: `Recordings` and `Transcriptions`.

Grabbing the list of today's files is easy:

```
find Transcriptions -type f -name "*$(date +%Y-%m-%d)*"
```

{% colorquote info %}
Normally I would do something like:

```
find Transcriptions -ctime -1
```

However, iCloud does not seem to fully respect the creation date for these files. If something is re-synced, it could have a creation date other than its actual recording time. Fortunately, the Stardate files all have their datetimes in their name.

If you know of a better approach, [I'm interested](mailto:dean@stardateapp.com).
{% endcolorquote %}

## Formatting

Now that we have the latest notes, we need to pull out tasks and make a list. I'm doing this using the [LLM command line tool](https://llm.datasette.io/en/stable/).

```
find Transcriptions -type f -name "*$(date +%Y-%m-%d)*" | \
xargs -I {} cat "{}" | \
llm -s "$(cat prompts/checklist.md)"
```

To break that down:

1. Get the list of filenames.
2. Read the text from each file.
3. Feed through llm with a system prompt read from another file.

The LLM takes this input:

```
Another thing I need to do, also finished, so I'd probably put
this earlier in the checklist, but I already took Iggy for a walk. So she's
been fed, she's been walked, all that good stuff.So I'm kind of putting
together a to-do list for today. The first item was to take the dog for a
walk and feed her. That is now done. I'm also meeting Jared for lunch today,
so that's something I need to do at about 11.30 is to head there and go meet
him for lunch. And then I would like to write a blog post about the... uh,
index card checklist project, but before I do that I have to set up the blog
on the website and make sure that it can, you know, I actually have a place
to put it. So, that'll probably be my afternoon writing those two things.
Uh, and then, uh, I'll see you guys next time. Bye. Yeah, that might be
about it.
```

...with this system prompt:

```
You are processing a transcription entry to identify chechklist items.
You ONLY return the list of items in the checklist. Use Markdown
formatting so that the items can be checked off.
You can check off any items which are complete.

Here's an example:

- [ ] To do item

BE SURE TO INCLUDE ALL ITEMS MENTIONED IN THE CHECKLIST.
DO NOT INCLUDE ANY OTHER TEXT IN YOUR RESPONSE.

Please take the following entry and output a checklist.
```

...and returns this output:

```
- [x] Take the dog for a walk
- [x] Feed the dog
- [ ] Meet Jared for lunch
- [ ] Write a blog post about the index card checklist project
- [ ] Set up the blog on the website
```

You might be thinking "hey, that's Markdown, not LaTeX! _J'accuse!_`"

You would be right. In order to get LaTeX output I use this system prompt (saved as `latex_checklist.md`) instead:

````
Given the following latex template, and the following checklist,
please convert the checklist into the latex template format.

You may nest lists as needed.

BE SURE TO INCLUDE ALL ITEMS MENTIONED IN THE CHECKLIST.
DO NOT INCLUDE ANY OTHER TEXT IN YOUR RESPONSE.

```latex
  \item
  \item
  % This is an example of a nested item
  \item[]
  \begin{itemize}[label=\largesquare, left=0pt, itemsep=0.2\baselineskip]
  	\item
  \end{itemize}
```
````

...which outputs:

```
   \item Take the dog for a walk and feed her. (Done)
   \item Meet Jared for lunch at 11:30.
   \begin{itemize}[label=\largesquare, left=0pt, itemsep=0.2\baselineskip]
    \item Set up the blog on the website.
    \item Write a blog post about the index card checklist project.
   \end{itemize}
```

{% colorquote info %}
Different LLMs have different results! My `llm` is set to use `gemma3:12b` locally via Ollama [by default](https://llm.datasette.io/en/stable/help.html#llm-models-help). This is the first local LLM I've found that can handle the LaTeX formatting correctly.

`llm` can use paid services like ChatGPT instead, but I like running this locally. I'm experimenting with getting `llama3.2:1b` to return correct formatting for Markdown in hopes that I can run this on the phone later.
{% endcolorquote %}

## Printing

Finally, I copy this output to my [LaTeX editor](https://pages.uoregon.edu/koch/texshop/), add anything else I thought of, and print it to an index card. I bought a mini yellow clipboard at a thrift store to carry it with me.

Keeping this last part manual lets me tweak things if I need to. For example, I might add checkboxes for medication reminders to the template. Sometimes I might make a generic checklist instead of a daily agenda. Also the LLM output is not perfect, and might need fixing. The flexibility is helpful.

<!--
Additionally, you may have noticed the "Geography Trivia of the Day" at the bottom of the agenda. I'm studying to up my [Learned League](https://www.learnedleague.com/) game and geography is my weakest subject. An LLM shortcut I wrote for [Alfred](https://www.alfredapp.com/) copies a piece of random trivia to my clipboard. So far even the simpler LLMs generally produce trivia I can verify on Wikipedia, which is interesting!
-->

Thanks for reading! _Check!_
