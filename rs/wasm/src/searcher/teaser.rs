const TERM_WEIGHT: u32 = 40;

pub struct Teaser {
    vec: Vec<(String, u32, usize)>,
    found: bool,
}

impl Teaser {
    pub fn default() -> Self {
        Self::new()
    }

    fn new() -> Self {
        Teaser {
            vec: Vec::new(),
            found: false,
        }
    }

    pub fn clear(&mut self) {
        self.vec.clear();
        self.found = false;
    }

    fn window_weight(&self, end: usize) -> Vec<u32> {
        let mut ret = Vec::new();
        let mut sum = 0;

        for x in self.vec.iter().take(end) {
            sum += x.1;
        }

        ret.push(sum);

        for i in 0..self.vec.len() - end {
            sum -= self.vec[i].1;
            sum += self.vec[i + end].1;

            ret.push(sum);
        }
        ret
    }

    fn calc_range(&self, count: usize) -> (usize, usize) {
        let end = std::cmp::min(self.vec.len(), count);

        if !self.found {
            return (0, end);
        }

        let mut start = 0;
        let mut max_sum = 0;

        let window = self.window_weight(end);

        for i in (0..window.len()).rev() {
            if window[i] > max_sum {
                max_sum = window[i];
                start = i;
            }
        }

        (start, end)
    }

    fn highlighting(&self, body: &str, count: usize) -> String {
        if self.vec.is_empty() {
            return body.to_string();
        }

        let range = self.calc_range(count);

        let mut highlight = Vec::new();
        let mut index = self.vec[range.0].2;

        for word in self.vec.iter().skip(range.0).take(range.1) {
            // missing text from index to the start of `word`
            if index < word.2 {
                highlight.push(&body[index..word.2]);
                index = word.2;
            }

            if word.1 != TERM_WEIGHT {
                highlight.push(&body[word.2..index + word.0.len()]);
            } else {
                highlight.push("<em>");
                highlight.push(&body[word.2..index + word.0.len()]);
                highlight.push("</em>");
            }

            index = word.2 + word.0.len();
        }

        highlight.join("")
    }

    pub fn search_result_excerpt(&mut self, body: &str, terms: Vec<&str>, count: usize) -> String {
        let mut idx = 0;

        for whole in body.to_lowercase().split(". ") {
            let words: Vec<&str> = whole.split(' ').collect();
            let mut value = 8;

            for separate in words {
                if !separate.is_empty() {
                    for term in terms.iter() {
                        if separate.to_lowercase().contains(&term.to_lowercase()) {
                            value = TERM_WEIGHT;
                            self.found = true;
                        }
                    }
                    self.vec.push((separate.to_string(), value, idx));
                    value = 2;
                }
                idx += separate.len();
                idx += 1; // ' ' or '.' if the last word in the sentence
            }

            idx += 1; // because we split at a two-char boundary '. '
        }

        self.highlighting(body, count)
    }
}
