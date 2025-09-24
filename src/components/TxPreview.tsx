import { IndexContext, Txo } from 'spv-store';
import styled from 'styled-components';
import { Ordinal } from 'yours-wallet-provider';
import { useTheme } from '../hooks/useTheme';
import { WhiteLabelTheme } from '../theme.types';
import { GP_BASE_URL, KNOWN_BURN_ADDRESSES } from '../utils/constants';
import { convertAtomicValueToReadableTokenValue, formatNumberWithCommasAndDecimals, truncate } from '../utils/format';
import { mapOrdinal } from '../utils/providerHelper';
import { Show } from './Show';
import lockImage from '../assets/lock.svg';
import { useMemo } from 'react';
import { FaFire } from 'react-icons/fa';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 90%;
`;

const SectionHeader = styled.h3<WhiteLabelTheme>`
  color: ${({ theme }) => theme.color.global.contrast};
  font-weight: 900;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
`;

const Row = styled.div<WhiteLabelTheme & { $toSign: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  background-color: ${({ theme }) => theme.color.global.row};
  border: ${({ theme, $toSign }) => ($toSign ? `1px solid ${theme.color.component.snackbarSuccess}` : 'none')};
  border-radius: 0.25rem;
`;

const Index = styled.div<WhiteLabelTheme>`
  font-weight: bold;
  color: ${({ theme }) => theme.color.global.gray};
  margin-right: 0.5rem;
`;

const RowData = styled.div<WhiteLabelTheme>`
  color: ${({ theme }) => theme.color.global.contrast};
`;

const NftImage = styled.img<{ $isCircle: boolean }>`
  width: ${({ $isCircle }) => ($isCircle ? '2rem' : '2.75rem')};
  height: ${({ $isCircle }) => ($isCircle ? '2rem' : '2.75rem')};
  border-radius: ${({ $isCircle }) => ($isCircle ? '50%' : '0.25rem')};
  margin: 0 0.25rem 0 0.5rem;
`;

const AmountImageWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const IndexOwnerWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const Label = styled.div<WhiteLabelTheme>`
  color: ${({ theme }) => theme.color.global.contrast};
  text-align: right;
`;

type TxPreviewProps = {
  txData: IndexContext;
  inputsToSign?: number[];
};

const TxPreview = ({ txData, inputsToSign }: TxPreviewProps) => {
  const { theme } = useTheme();
  const labelMaxLength = 20;
  
  const mappedInputs = useMemo(() => {
    try {
      return txData?.spends?.map((txo: Txo) => mapOrdinal(txo)) || [];
    } catch (error) {
      console.error('Error mapping inputs:', error);
      return [];
    }
  }, [txData]);
  
  const mappedOutputs = useMemo(() => {
    try {
      return txData?.txos?.map((txo: Txo) => mapOrdinal(txo)) || [];
    } catch (error) {
      console.error('Error mapping outputs:', error);
      return [];
    }
  }, [txData]);

  const renderNftOrTokenImage = (ordinal: Ordinal) => {
    try {
      const inscriptionWithOutpoint =
        ordinal?.origin?.data?.insc?.file?.type?.startsWith('image') && !!ordinal.origin?.outpoint;
      const bsv20WithIcon = !!ordinal?.data?.bsv20 && !!ordinal.data.bsv20.icon;
      const isLock = !!ordinal?.data?.lock;

      if (inscriptionWithOutpoint) {
        return (
          <NftImage 
            $isCircle={false} 
            src={`${GP_BASE_URL}/content/${ordinal.origin?.outpoint}`} 
            alt="NFT"
            onError={(e) => {
              console.warn('Failed to load NFT image:', ordinal.origin?.outpoint);
              e.currentTarget.style.display = 'none';
            }}
          />
        );
      }

      if (bsv20WithIcon) {
        return (
          <NftImage
            $isCircle
            src={
              ordinal.data.bsv20?.icon?.startsWith('https://')
                ? ordinal.data.bsv20.icon
                : `${GP_BASE_URL}/content/${ordinal.data.bsv20?.icon}`
            }
            alt="Token"
            onError={(e) => {
              console.warn('Failed to load token image:', ordinal.data.bsv20?.icon);
              e.currentTarget.style.display = 'none';
            }}
          />
        );
      }

      if (isLock) {
        return <NftImage $isCircle src={lockImage} alt="Lock" />;
      }
      return null;
    } catch (error) {
      console.error('Error rendering NFT/token image:', error);
      return null;
    }
  };

  if (!txData) {
    return (
      <Container>
        <SectionHeader theme={theme}>Transaction Preview</SectionHeader>
        <RowData theme={theme}>No transaction data available</RowData>
      </Container>
    );
  }
  
  if (!mappedInputs || !mappedOutputs) {
    return (
      <Container>
        <SectionHeader theme={theme}>Transaction Preview</SectionHeader>
        <RowData theme={theme}>Loading transaction data...</RowData>
      </Container>
    );
  }

  return (
    <Container>
      <SectionHeader theme={theme} style={{ marginTop: '0.5rem' }}>
        Inputs
      </SectionHeader>
      {mappedInputs.map((input: Ordinal, index: number) => {
        return (
          <Row $toSign={!!inputsToSign?.includes(index)} key={index} theme={theme}>
            <IndexOwnerWrapper>
              <Index theme={theme}>#{index}</Index>
              {<RowData theme={theme}>{input.owner ? truncate(input.owner, 6, 6) : 'Script/Contract'}</RowData>}
              {!!inputsToSign?.includes(index) && (
                <RowData style={{ marginLeft: '0.5rem' }} theme={theme}>
                  ✍️
                </RowData>
              )}
            </IndexOwnerWrapper>

            <AmountImageWrapper>
              <RowData theme={theme}>
                <Show
                  when={!!input.data.bsv20}
                  whenFalseContent={
                    <Show
                      when={!!input.origin?.data?.map?.name}
                      whenFalseContent={
                        <Label theme={theme}>
                          {formatNumberWithCommasAndDecimals(input.satoshis, 0)} {input.satoshis > 1 ? 'sats' : 'sat'}
                        </Label>
                      }
                    >
                      <Label theme={theme}>
                        {input.origin?.data?.map?.name && truncate(input.origin.data.map.name, labelMaxLength, 0)}
                      </Label>
                    </Show>
                  }
                >
                  <Label theme={theme}>
                    {convertAtomicValueToReadableTokenValue(
                      Number(input.data.bsv20?.amt),
                      Number(input.data.bsv20?.dec),
                    )}{' '}
                    {truncate(input.data.bsv20?.tick ?? input.data.bsv20?.sym ?? 'Unknown FT', labelMaxLength, 0)}
                  </Label>
                </Show>
              </RowData>
              {renderNftOrTokenImage(input)}
            </AmountImageWrapper>
          </Row>
        );
      })}

      <SectionHeader theme={theme}>Outputs</SectionHeader>
      {mappedOutputs.map((output: Ordinal, index: number) => {
        return (
          <Row $toSign={false} key={index} theme={theme}>
            <IndexOwnerWrapper>
              <Index theme={theme}>#{index}</Index>
              <RowData theme={theme}>{output.owner ? truncate(output.owner, 6, 6) : 'Script/Contract'}</RowData>
              <Show when={!!output.owner && KNOWN_BURN_ADDRESSES.includes(output.owner)}>
                <FaFire color={theme.color.component.snackbarError} size={'1rem'} style={{ marginLeft: '0.5rem' }} />
              </Show>
            </IndexOwnerWrapper>

            <AmountImageWrapper>
              <RowData theme={theme}>
                <Show
                  when={!!output.data.bsv20}
                  whenFalseContent={
                    <Show
                      when={!!output.origin?.data?.map?.name}
                      whenFalseContent={
                        <Label theme={theme}>
                          {formatNumberWithCommasAndDecimals(output.satoshis, 0)} {output.satoshis > 1 ? 'sats' : 'sat'}
                        </Label>
                      }
                    >
                      <Label theme={theme}>
                        {output.origin?.data?.map?.name && truncate(output.origin.data.map.name, labelMaxLength, 0)}
                      </Label>
                    </Show>
                  }
                >
                  <Label theme={theme}>
                    {convertAtomicValueToReadableTokenValue(
                      Number(output.data.bsv20?.amt),
                      Number(output.data.bsv20?.dec),
                    )}{' '}
                    {truncate(output.data.bsv20?.tick || output.data.bsv20?.sym || 'Unknown FT', labelMaxLength, 0)}
                  </Label>
                </Show>
              </RowData>
              {renderNftOrTokenImage(output)}
            </AmountImageWrapper>
          </Row>
        );
      })}
    </Container>
  );
};

export default TxPreview;
