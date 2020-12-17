import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-fetching-library';
import { Row, Col } from 'react-flexa';
import PropTypes from 'prop-types';
import { Field, Formik, Form } from 'formik';
import { get } from 'lodash';
import qs from 'qs';
import * as yup from 'yup';
import { Padding } from 'styled-components-spacing';
import Button from '../shared/Button';
import ModalBlock from '../shared/ModalBlock';
import Input from '../shared/Input';

const { GOOGLE_API_KEY } = process.env;

const validationSchema = yup.object().shape({
  videoUrl: yup.string()
    .required('Required')
    .test(
      'isValid', 'Only YouTube videos are supported for now',
      (value) => (value || '').match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/gm),
    ),
});

const getYouTubeVideoInfo = (videoUrl) => ({
  method: 'GET',
  endpoint: `https://www.googleapis.com/youtube/v3/videos?${
    qs.stringify({
      id: Object.values(qs.parse(videoUrl))[0],
      part: 'snippet',
      key: GOOGLE_API_KEY,
    })
  }`,
  external: true,
});

const AddVideoForm = ({
  open,
  toggle,
  name,
  value,
  setFieldValue,
}) => {
  const [videoUrl, setVideoUrl] = useState('');
  const { query } = useQuery(getYouTubeVideoInfo(videoUrl), false);

  useEffect(() => {
    if (videoUrl) {
      query().then(({
        payload: {
          items,
        } = {},
      }) => {
        const {
          publishedAt,
          title,
          thumbnails = {},
        } = get(items, '0.snippet');
        setFieldValue(name, [
          ...value,
          {
            type: 'youtube',
            title,
            publishDate: publishedAt,
            mainPhotoObject: {
              // Find max resolution thumbnail
              photoUrl: Object.values(thumbnails).reduce((thumbnail1, thumbnail2) => (
                thumbnail1.width > thumbnail2.width
                  ? thumbnail1
                  : thumbnail2
              ), { width: 0 }).url,
            },
          },
        ]);
      });
    }
  }, [videoUrl]);
  return (
    <ModalBlock
      open={open}
      toggle={toggle}
      label="Add Video"
      width={{ xs: '', sm: '20rem' }}
    >
      <Padding all={{ xs: 4 }} top={{ xs: 0 }}>
        <Formik
          initialValues={{
            videoUrl: '',
          }}
          onSubmit={(values, { setSubmitting }) => {
            setSubmitting(false);
            setVideoUrl(values.videoUrl);
            toggle();
          }}
          validationSchema={validationSchema}
        >
          {() => (
            <Form>
              <Field name="videoUrl">
                {({ field }) => (
                  <Input type="text" placeholder="Video URL" {...field}/>
                )}
              </Field>
              <Padding top={{ xs: 4 }} bottom={{ xs: 3 }}>
                <Row flexDirection="row" style={{ textAlign: 'center' }}>
                  <Col xs={6}>
                    <Button dark rounded wide type="submit">
                      done
                    </Button>
                  </Col>
                  <Col xs={6}>
                    <Button type="button" grey rounded wide onClick={toggle}>
                      cancel
                    </Button>
                  </Col>
                </Row>
              </Padding>
            </Form>
          )}
        </Formik>
      </Padding>
    </ModalBlock>
  );
};

AddVideoForm.propTypes = {
  open: PropTypes.bool,
  toggle: PropTypes.func,
  name: PropTypes.string,
  value: PropTypes.array,
  setFieldValue: PropTypes.func,
};

export default AddVideoForm;
