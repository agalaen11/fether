// Copyright 2015-2019 Parity Technologies (UK) Ltd.
// This file is part of Parity.
//
// SPDX-License-Identifier: BSD-3-Clause

import React, { Component } from 'react';
import { Field, Form } from 'react-final-form';
import { Form as FetherForm, Header } from 'fether-ui';
import { inject, observer } from 'mobx-react';
import IdleTimer from 'react-idle-timer';
import { Link, Redirect } from 'react-router-dom';
import { withProps } from 'recompose';

import i18n, { packageNS } from '../../i18n';
import RequireHealthOverlay from '../../RequireHealthOverlay';
import TokenAddress from '../../Tokens/TokensList/TokenAddress';
import withAccount from '../../utils/withAccount.js';
import withTokens from '../../utils/withTokens';

@inject('sendStore')
@withAccount
@withTokens
@withProps(({ match: { params: { tokenAddress } }, tokens }) => ({
  token: tokens[tokenAddress]
}))
@observer
class Unlock extends Component {
  handleAccept = values => {
    const {
      account: { address },
      history,
      sendStore,
      token
    } = this.props;

    return sendStore
      .send(values.password)
      .then(() => history.push(`/send/${token.address}/from/${address}/sent`))
      .catch(error => ({
        password:
          error.text === 'Method not found'
            ? "Please enable the 'personal' api in the --ws-apis launch flag of Parity Ethereum."
            : error.text
      }));
  };

  render () {
    const {
      account: { address },
      history,
      sendStore: { tx },
      token
    } = this.props;

    if (!tx || !token) {
      return <Redirect to='/' />;
    }

    return (
      <div>
        <IdleTimer onIdle={history.goBack} timeout={1000 * 60} />

        <Header
          left={
            <Link to={`/tokens/${address}`} className='icon -back'>
              {i18n.t(`${packageNS}:navigation.close`)}
            </Link>
          }
          title={
            token && (
              <h1>
                {i18n.t(`${packageNS}:tx.header_send_prefix`, {
                  token: token.name
                })}
              </h1>
            )
          }
        />
        <RequireHealthOverlay require='sync'>
          <div className='window_content'>
            <div className='box -padded'>
              <TokenAddress
                copyAddress
                drawers={[
                  <div key='txForm'>
                    <FetherForm.Field
                      as='textarea'
                      className='form_field_value'
                      disabled
                      defaultValue={tx.to}
                      label={i18n.t(`${packageNS}:tx.form.field.to`)}
                    />

                    <FetherForm.Field
                      className='form_field_value'
                      disabled
                      defaultValue={`${tx.amount} ${token.symbol}`}
                      label={i18n.t(`${packageNS}:tx.form.field.amount`)}
                    />
                  </div>,
                  <Form
                    key='signerForm'
                    onSubmit={this.handleAccept}
                    render={({ handleSubmit, pristine, submitting }) => (
                      <form noValidate onSubmit={handleSubmit}>
                        <div className='text'>
                          <p>{i18n.t(`${packageNS}:tx.form.label_unlock`)}</p>
                        </div>

                        <Field
                          autoFocus
                          label={i18n.t(`${packageNS}:tx.form.field.password`)}
                          name='password'
                          render={FetherForm.Field}
                          required
                          type='password'
                        />

                        <nav className='form-nav -binary'>
                          <button
                            className='button -back'
                            onClick={history.goBack}
                            type='button'
                          >
                            {i18n.t(`${packageNS}:navigation.back`)}
                          </button>

                          <button
                            className='button -submit'
                            disabled={pristine || submitting}
                          >
                            {i18n.t(`${packageNS}:tx.form.button_confirm_tx`)}
                          </button>
                        </nav>
                      </form>
                    )}
                  />
                ]}
                shortAddress={false}
              />
            </div>
          </div>
        </RequireHealthOverlay>
      </div>
    );
  }
}

export default Unlock;
