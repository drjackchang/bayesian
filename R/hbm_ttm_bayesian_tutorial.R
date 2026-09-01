# Bayesian HBM × TTM 安全搬運教學
# 完全合成教學資料，不是真實受試者資料。
library(tidyverse)
library(brms)
library(bayesplot)
library(posterior)

dat <- read.csv("data/hbm_ttm_safe_handling_demo.csv")

# 0. 先看資料
glimpse(dat)
table(dat$group, dat$time)
table(dat$ttm_stage)
summary(dat$safe_behavior)

dat <- dat %>%
  mutate(
    id = factor(id),
    station = factor(station),
    group = factor(group, levels = c("control", "intervention")),
    time = factor(time, levels = c("pre", "post", "followup")),
    ttm_stage = ordered(ttm_stage, levels = 1:5)
  )

# ------------------------------------------------------------
# MODEL A：HBM 六構面 → TTM stage
# ------------------------------------------------------------
pre <- dat %>%
  filter(time == "pre") %>%
  mutate(
    across(
      c(susceptibility, severity, benefits, barriers,
        self_efficacy, cues_to_action),
      ~ as.numeric(scale(.x)),
      .names = "{.col}_z"
    )
  )

get_prior(
  ttm_stage ~ susceptibility_z + severity_z + benefits_z +
    barriers_z + self_efficacy_z + cues_to_action_z,
  data = pre,
  family = cumulative("logit")
)

prior_stage <- c(
  prior(normal(0, 0.5), class = "b")
)

fit_stage <- brm(
  ttm_stage ~ susceptibility_z + severity_z + benefits_z +
    barriers_z + self_efficacy_z + cues_to_action_z,
  data = pre,
  family = cumulative("logit"),
  prior = prior_stage,
  chains = 4, cores = 4, iter = 4000,
  seed = 20260901
)

summary(fit_stage)
plot(fit_stage)
pp_check(fit_stage)
fixef(fit_stage)
hypothesis(fit_stage, "self_efficacy_z > 0")
plot(conditional_effects(fit_stage), points = TRUE)

# Prior sensitivity：較寬 prior
fit_stage_wider <- update(
  fit_stage,
  prior = prior(normal(0, 1), class = "b"),
  seed = 20260902
)
summary(fit_stage_wider)

# ------------------------------------------------------------
# MODEL B：介入組 vs 對照組，前測／後測／追蹤
# ------------------------------------------------------------
prior_behavior <- c(
  prior(normal(3, 1), class = "Intercept"),
  prior(normal(0, 0.5), class = "b"),
  prior(exponential(1), class = "sd"),
  prior(exponential(1), class = "sigma")
)

fit_behavior <- brm(
  safe_behavior ~ group * time + (1 | id) + (1 | station),
  data = dat,
  family = gaussian(),
  prior = prior_behavior,
  chains = 4, cores = 4, iter = 4000,
  seed = 20260903
)

summary(fit_behavior)
plot(fit_behavior)
pp_check(fit_behavior)
fixef(fit_behavior)

# 係數名稱先用 fixef() 確認
hypothesis(fit_behavior, "groupintervention:timepost > 0")
hypothesis(fit_behavior, "groupintervention:timefollowup > 0")
plot(conditional_effects(fit_behavior, effects = "group:time"))

# ------------------------------------------------------------
# PRIOR PREDICTIVE CHECK
# ------------------------------------------------------------
prior_only <- brm(
  safe_behavior ~ group * time + (1 | id) + (1 | station),
  data = dat,
  family = gaussian(),
  prior = prior_behavior,
  sample_prior = "only",
  chains = 4, cores = 4, iter = 2000,
  seed = 20260904
)
pp_check(prior_only)

# ------------------------------------------------------------
# 最低限度報告
# - posterior estimate
# - 95% credible interval
# - P(effect > 0 | data)
# - 若有實務門檻：P(effect > threshold | data)
# - predicted probabilities / means
# - prior sensitivity
# - R-hat / ESS / sampling diagnostics
# - posterior predictive check
# ------------------------------------------------------------
