const TERM_WEIGHT: usize = 40;

const MARK_TAG: &str = "<mark>";
const MARK_TAG_END: &str = "</mark>";

struct Entry {
    term: String,
    index: usize,
    weight: usize,
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

        let mut sum = self.entry.iter().take(end).map(|x| x.weight).sum::<usize>();

        let itr = std::iter::once(sum).chain((0..self.entry.len() - end).map(move |i| {
            sum -= self.entry[i].weight;
            sum += self.entry[i + end].weight;
            sum
        }));

        let start = itr
            .enumerate()
            .filter(|(_, sum)| *sum > 0)
            .map(|(i, _)| i)
            .next()
            .unwrap_or(0);

        (start, end)
    }

    fn highlighting(&self, body: &str, count: u8) -> String {
        if self.entry.is_empty() {
            return body.to_string();
        }

        let (start, end) = self.calc_range(count);

        let mut highlight = String::new();
        let mut index = self.entry[start].index;

        for word in self.entry.iter().skip(start).take(end) {
            // missing text from index to the start of `word`
            if index < word.index {
                highlight.push_str(&body[index..word.index]);
                index = word.index;
            }

            // Combine both conditions into one block
            if word.weight == TERM_WEIGHT {
                highlight.push_str(MARK_TAG);
                highlight.push_str(&body[word.index..index + word.term.len()]);
                highlight.push_str(MARK_TAG_END);
            } else {
                highlight.push_str(&body[word.index..index + word.term.len()]);
            }

            index = word.index + word.term.len();
        }

        highlight
    }

    pub fn search_result_excerpt(&mut self, body: &str, terms: Vec<&str>, count: u8) -> String {
        let body_lower = body.to_lowercase();
        let terms: Vec<String> = terms.iter().map(|t| t.to_lowercase()).collect();

        let mut idx = 0;

        for sentence in body_lower.split(". ") {
            let words: Vec<&str> = sentence.split(' ').collect();
            let mut value = 8;

            for word in words {
                if !word.is_empty() {
                    if terms.iter().any(|term| word.contains(term)) {
                        value = TERM_WEIGHT;
                        self.found = true;
                    }

                    self.entry.push(Entry {
                        term: word.to_string(),
                        index: idx,
                        weight: value,
                    });

                    value = 2;
                }
                idx += word.len();
                idx += 1; // ' ' or '.' if the last word in the sentence
            }

            idx += 1; // because we split at a two-char boundary '. '
        }

        self.highlighting(body, count)
    }
}
