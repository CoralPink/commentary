const DEFAULT_IMPORTANCE: usize = 2;
const FIRST_WORD_IMPORTANCE: usize = 8;
const MATCH_IMPORTANCE: usize = 40;

const MARK_TAG: &str = "<mark>";
const MARK_TAG_END: &str = "</mark>";

struct Entry {
    term: String,
    index: usize,
    importance: usize,
}

#[derive(Default)]
pub struct Teaser {
    entry: Vec<Entry>,
    found: bool,
}

impl Teaser {
    pub fn clear(&mut self) {
        self.entry.clear();
        self.found = false;
    }

    fn calc_range(&self, count: u8) -> (usize, usize) {
        let end = std::cmp::min(self.entry.len(), count as usize);

        if !self.found {
            return (0, end);
        }

        let mut potencial = self.entry.iter().take(end).map(|x| x.importance).sum::<usize>();

        let (start, _) = std::iter::once(potencial)
            .chain((0..self.entry.len() - end).map(move |i| {
                potencial -= self.entry[i].importance;
                potencial += self.entry[i + end].importance;
                potencial
            }))
            .enumerate()
            .max_by_key(|&(_, potencial)| potencial)
            .unwrap_or((0, 0));

        (start, end)
    }

    fn highlighting(&self, body: &str, count: u8) -> String {
        if self.entry.is_empty() {
            return body.to_string();
        }

        let (start, end) = self.calc_range(count);

        let mut highlight = String::new();
        let mut idx = self.entry[start].index;

        for word in self.entry.iter().skip(start).take(end) {
            // missing text from index to the start of `word`
            if idx < word.index {
                highlight.push_str(&body[idx..word.index]);
                idx = word.index;
            }

            let str = &body[word.index..idx + word.term.len()];

            // Combine both conditions into one block
            if word.importance == MATCH_IMPORTANCE {
                highlight.push_str(MARK_TAG);
                highlight.push_str(str);
                highlight.push_str(MARK_TAG_END);
            } else {
                highlight.push_str(str);
            }

            idx = word.index + word.term.len();
        }

        highlight
    }

    pub fn search_result_excerpt(&mut self, body: &str, normalized_terms: &[String], count: u8) -> String {
        let mut index: usize = 0;

        for sentence in body.to_lowercase().split(". ") {
            let mut importance = FIRST_WORD_IMPORTANCE;

            for word in sentence.split(' ').collect::<Vec<&str>>() {
                if word.is_empty() {
                    index += 1; // ' ' or '.' if the last word in the sentence
                    continue;
                }

                if normalized_terms.iter().any(|term| word.contains(term)) {
                    importance = MATCH_IMPORTANCE;
                    self.found = true;
                }

                self.entry.push(Entry {
                    term: word.to_string(),
                    index,
                    importance,
                });

                importance = DEFAULT_IMPORTANCE;
                index += word.len() + 1;
            }

            index += 1; // because we split at a two-char boundary '. '
        }

        self.highlighting(body, count)
    }
}
