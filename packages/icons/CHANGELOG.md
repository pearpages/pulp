# @pearpages/pulp-icons

## 0.2.1

### Patch Changes

- 190eb4a: Package metadata: `keywords`, `homepage` (the docs site) and `bugs` (GitHub issues) on every package, so npm search finds them and each npm page links back to the docs.

## 0.2.0

### Minor Changes

- 6aa8b0b: 40 new glyphs (52 in the set), all drawn for pulp on the 24 grid: AlertCircle, Archive, Ban, Bookmark, Car, Chain, CheckCircle, Compass, Crosshair, Export, Filter, GripVertical, Heart, HelpCircle, MapFolded, MapPin, Meh, Message, Moon, Note, Page, Pencil, Picture, Send, Settings, Share, ShieldCheck, Star, Sun, Tag, Trash, TrendingUp, Trophy, Umbrella, Undo, User, Users, Utensils, ZoomIn, Mail. Outline only: set `fill: currentColor` from CSS for a filled state.

## 0.1.0

### Minor Changes

- 1fdb7e7: First release. Twelve stroke icons as React components, generated from SVG: arrows left and right,
  chevrons down, left and right, check, close, plus, search, calendar, info and warning. One entry,
  tree-shaken per icon (`sideEffects: false`); decorative unless given a `title`.
