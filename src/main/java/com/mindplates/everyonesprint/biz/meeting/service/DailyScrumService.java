package com.mindplates.everyonesprint.biz.meeting.service;

import com.mindplates.everyonesprint.biz.meeting.entity.Meeting;
import com.mindplates.everyonesprint.biz.meeting.redis.Participant;
import com.mindplates.everyonesprint.biz.meeting.repository.ParticipantRepository;
import com.mindplates.everyonesprint.common.vo.UserSession;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Example;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
@Transactional
@AllArgsConstructor
public class DailyScrumService {

    final private ParticipantRepository participantRepository;
    final private MeetingService meetingService;

    public List<Participant> createDailyScrumInfo(Meeting meeting, UserSession userSession, boolean resetAll) {
        Participant condition = Participant.builder().code(meeting.getCode()).build();
        Iterable<Participant> users = participantRepository.findAll(Example.of(condition));

        List<Participant> list = StreamSupport.stream(users.spliterator(), false).collect(Collectors.toList());
        Collections.shuffle(list);

        int counter = resetAll ? 0 : Optional.ofNullable(meeting.getCurrentMaxOrder()).orElse(0);
        boolean marked = false;
        for (Participant user : list) {
            if (resetAll) {
                user.setIsDailyScrumDone(false);
                if (Optional.ofNullable(user.getConnected()).orElse(false)) {
                    user.setDailyScrumOrder(counter);
                    if (counter == 0) {
                        user.setIsCurrentSpeaker(true);
                    }
                    counter++;
                } else {
                    user.setDailyScrumOrder(null);
                }
            } else {
                if (user.getDailyScrumOrder() == null && Optional.ofNullable(user.getConnected()).orElse(false)) {
                    user.setDailyScrumOrder(counter);
                    if (!marked) {
                        marked = true;
                        user.setIsCurrentSpeaker(true);
                    }
                    counter++;
                } else {
                    user.setDailyScrumOrder(null);
                }
            }
            participantRepository.save(user);
        }

        Collections.sort(list);

        meeting.setCurrentMaxOrder(counter);
        meeting.setDailyScrumStarted(list.stream().anyMatch(Participant::getIsCurrentSpeaker));
        meetingService.updateMeetingInfo(meeting, userSession);

        return list;
    }

    public void updateDailyScrumStop(Meeting meeting, UserSession userSession) {
        Participant condition = Participant.builder().code(meeting.getCode()).build();
        Iterable<Participant> users = participantRepository.findAll(Example.of(condition));
        for (Participant user : users) {
            if (Optional.ofNullable(user.getIsCurrentSpeaker()).orElse(false)) {
                user.setIsCurrentSpeaker(false);
                participantRepository.save(user);
            }
        }

        meeting.setDailyScrumStarted(false);
        meetingService.updateMeetingInfo(meeting, userSession);
    }

    public List<Participant> updateUserDailyScrumDone(Meeting meeting, UserSession userSession) {
        Participant condition = Participant.builder().code(meeting.getCode()).build();
        Iterable<Participant> users = participantRepository.findAll(Example.of(condition));

        List<Participant> list = StreamSupport.stream(users.spliterator(), false).sorted().collect(Collectors.toList());

        for (int firstIndex = 0; firstIndex < list.size(); firstIndex++) {
            Participant participant = list.get(firstIndex);
            if (userSession.getId().toString().equals(participant.getId())) {
                participant.setIsDailyScrumDone(true);
                participant.setIsCurrentSpeaker(false);
                participantRepository.save(participant);

                if (firstIndex < list.size() - 1) {
                    for (int secondIndex = firstIndex + 1; secondIndex < list.size(); secondIndex++) {
                        Participant nextParticipant = list.get(secondIndex);
                        if (Optional.ofNullable(nextParticipant.getConnected()).orElse(false) && !Optional.ofNullable(nextParticipant.getIsDailyScrumDone()).orElse(false)) {
                            nextParticipant.setIsCurrentSpeaker(true);
                            participantRepository.save(nextParticipant);
                            break;
                        }
                    }
                }

                break;
            }
        }

        if (list.stream().noneMatch(Participant::getIsCurrentSpeaker)) {
            meeting.setDailyScrumStarted(false);
            meetingService.updateMeetingInfo(meeting, userSession);
        }

        return list;
    }


    public List<Participant> updateAddUserDailyScrumInfo(Meeting meeting, UserSession userSession) {
        Participant condition = Participant.builder().code(meeting.getCode()).build();
        Iterable<Participant> users = participantRepository.findAll(Example.of(condition));

        List<Participant> sortedList = StreamSupport.stream(users.spliterator(), false).sorted().collect(Collectors.toList());

        if (Optional.ofNullable(meeting.getDailyScrumStarted()).orElse(false)) {
            sortedList
                    .stream()
                    .filter(participant -> userSession.getId().toString().equals(participant.getId()) && !Optional.ofNullable(participant.getIsDailyScrumDone()).orElse(false))
                    .findFirst()
                    .ifPresent(participant -> {
                        participant.setDailyScrumOrder(meeting.getCurrentMaxOrder());
                        if (sortedList.stream().noneMatch(Participant::getIsCurrentSpeaker)) {
                            participant.setIsCurrentSpeaker(true);
                        }
                        participantRepository.save(participant);
                        meeting.setCurrentMaxOrder(meeting.getCurrentMaxOrder() + 1);
                        meetingService.updateMeetingInfo(meeting, userSession);
                    });
        }

        return sortedList;
    }


}
