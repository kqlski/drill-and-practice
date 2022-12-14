import { executeQuery } from "../database/database.js";
import { getOptionsById, getQuestionById } from "./questionService.js";
const getStatistics = async () => {
  const res = await executeQuery(
    "select * from\
     (select count(topics.id) as topic_count from topics) as topics,\
     (select count(*) as question_count from questions) as questions,\
     (select count(*) as correct_count from question_answers a\
      join question_answer_options o on a.question_answer_option_id=o.id\
       where o.is_correct) as correct_answers,\
       (select count(*) as incorrect_count from question_answers a\
       join question_answer_options o on a.question_answer_option_id=o.id\
        where not o.is_correct) as incorrect_answers"
  );
  return res.rows[0];
};
const getRandomQuestionId = async (topic_id) => {
  let res;
  if (topic_id) {
    res = await executeQuery(
      "SELECT q.id from (SELECT * from questions WHERE topic_id=$topic_id) as q left join question_answer_options as qa ON q.id=qa.question_id ORDER BY random() LIMIT 1",
      { topic_id }
    );
  } else {
    res = await executeQuery(
      "SELECT q.id from questions as q left join question_answer_options as qa ON q.id=qa.question_id ORDER BY random() LIMIT 1"
    );
  }
  return res.rows[0]?.id;
};
const getQuestion = async (question_id) => {
  const promises = [getQuestionById(question_id), getOptionsById(question_id)];
  const [question, options] = await Promise.all(promises);
  return {
    topicId: question.topic_id,
    questionId: question.id,
    questionText: question.question_text.trim(),
    answerOptions: options.map((option) => ({
      optionId: option.id,
      optionText: option.option_text.trim(),
    })),
  };
};
const getRandomQuestion = async (topic_id) => {
  const id = await getRandomQuestionId(topic_id);
  return await getQuestion(id);
};

const saveAnswer = async (option_id, question_id, user_id) => {
  await executeQuery(
    "INSERT INTO question_answers (user_id,question_id,question_answer_option_id) values ($user_id,$question_id,$option_id)",
    {
      user_id,
      option_id,
      question_id,
    }
  );
};
export {
  getRandomQuestion,
  getRandomQuestionId,
  getQuestion,
  saveAnswer,
  getStatistics,
};
